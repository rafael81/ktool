package com.kdocumenttool.pdf

import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.provider.DocumentsContract
import java.io.IOException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext

fun interface PdfCreator {
  suspend fun create(
    destination: Uri,
    images: List<SelectedImage>,
    options: PdfOptions,
    onProgress: (completed: Int, total: Int) -> Unit,
  )
}

class PdfCreationException(message: String, cause: Throwable? = null) : IOException(message, cause)

class AndroidPdfCreator(
  context: Context,
  private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) : PdfCreator {
  private val resolver = context.applicationContext.contentResolver

  override suspend fun create(
    destination: Uri,
    images: List<SelectedImage>,
    options: PdfOptions,
    onProgress: (completed: Int, total: Int) -> Unit,
  ) {
    try {
      withContext(ioDispatcher) {
        if (images.isEmpty()) throw PdfCreationException("이미지를 다시 선택해 주세요.")

        val geometry = PdfLayout.pageGeometry(options)
        val document = PdfDocument()
        try {
          images.forEachIndexed { index, selectedImage ->
            coroutineContext.ensureActive()
            val bitmap =
              try {
                PlatformImageLoader.loadForPdf(
                  resolver = resolver,
                  uri = Uri.parse(selectedImage.uri),
                  maximumWidth =
                    geometry.contentWidth * PDF_BITMAP_SCALE_NUMERATOR /
                      PDF_BITMAP_SCALE_DENOMINATOR,
                  maximumHeight =
                    geometry.contentHeight * PDF_BITMAP_SCALE_NUMERATOR /
                      PDF_BITMAP_SCALE_DENOMINATOR,
                )
              } catch (cancellation: CancellationException) {
                throw cancellation
              } catch (throwable: Throwable) {
                throw PdfCreationException(
                  "${index + 1}번째 이미지를 읽을 수 없습니다. 이미지를 다시 선택해 주세요.",
                  throwable,
                )
              }

            try {
              val pageInfo =
                PdfDocument.PageInfo.Builder(geometry.width, geometry.height, index + 1).create()
              val page = document.startPage(pageInfo)
              try {
                page.canvas.drawColor(Color.WHITE)
                val fitted = PdfLayout.fitCenter(bitmap.width, bitmap.height, geometry)
                page.canvas.drawBitmap(
                  bitmap,
                  null,
                  RectF(fitted.left, fitted.top, fitted.right, fitted.bottom),
                  IMAGE_PAINT,
                )
              } finally {
                document.finishPage(page)
              }
            } finally {
              bitmap.recycle()
            }
            onProgress(index + 1, images.size)
          }

          coroutineContext.ensureActive()
          try {
            resolver.openOutputStream(destination, "w")?.use(document::writeTo)
              ?: throw IOException("저장 위치를 열 수 없습니다.")
          } catch (cancellation: CancellationException) {
            throw cancellation
          } catch (throwable: Throwable) {
            throw PdfCreationException("선택한 위치에 PDF를 저장할 수 없습니다.", throwable)
          }
        } finally {
          document.close()
        }
      }
    } catch (throwable: Throwable) {
      val cleanupResult =
        withContext(NonCancellable + ioDispatcher) {
          val deleted =
            runCatching { DocumentsContract.deleteDocument(resolver, destination) }
              .getOrDefault(false)
          when {
            deleted -> PartialOutputCleanup.DELETED
            runCatching {
                resolver.openOutputStream(destination, "wt")?.use { true } ?: false
              }
              .getOrDefault(false) -> PartialOutputCleanup.TRUNCATED
            else -> PartialOutputCleanup.FAILED
          }
        }
      if (throwable is CancellationException) throw throwable

      val originalMessage =
        throwable.message?.takeIf(String::isNotBlank)
          ?: "PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요."
      when (cleanupResult) {
        PartialOutputCleanup.DELETED -> throw throwable
        PartialOutputCleanup.TRUNCATED ->
          throw PdfCreationException(
            "$originalMessage 저장 위치에 빈 파일이 남을 수 있습니다.",
            throwable,
          )
        PartialOutputCleanup.FAILED ->
          throw PdfCreationException(
            "$originalMessage 저장 위치의 불완전 파일을 직접 삭제해 주세요.",
            throwable,
          )
      }
    }
  }

  private companion object {
    // Platform PdfDocument retains page display lists until writeTo(). A 3/2 scale and ten-page
    // limit keep the worst case near 45 MiB of ARGB raster data while preserving roughly 108 dpi.
    const val PDF_BITMAP_SCALE_NUMERATOR = 3
    const val PDF_BITMAP_SCALE_DENOMINATOR = 2
    val IMAGE_PAINT = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
  }

  private enum class PartialOutputCleanup {
    DELETED,
    TRUNCATED,
    FAILED,
  }
}
