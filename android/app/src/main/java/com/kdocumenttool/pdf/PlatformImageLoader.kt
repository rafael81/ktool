package com.kdocumenttool.pdf

import android.content.ContentResolver
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.graphics.Matrix
import android.net.Uri
import android.os.Build
import android.os.CancellationSignal
import android.util.Size
import androidx.annotation.RequiresApi
import androidx.exifinterface.media.ExifInterface
import java.io.FileNotFoundException

internal object PlatformImageLoader {
  fun loadForPdf(
    resolver: ContentResolver,
    uri: Uri,
    maximumWidth: Int,
    maximumHeight: Int,
  ): Bitmap =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      loadWithImageDecoder(resolver, uri, maximumWidth, maximumHeight)
    } else {
      loadWithBitmapFactory(resolver, uri, maximumWidth, maximumHeight)
    }

  fun loadThumbnail(
    resolver: ContentResolver,
    uri: Uri,
    cancellationSignal: CancellationSignal,
  ): Bitmap =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      resolver.loadThumbnail(uri, Size(240, 240), cancellationSignal)
    } else {
      loadWithBitmapFactory(resolver, uri, 240, 240)
    }

  @RequiresApi(Build.VERSION_CODES.P)
  private fun loadWithImageDecoder(
    resolver: ContentResolver,
    uri: Uri,
    maximumWidth: Int,
    maximumHeight: Int,
  ): Bitmap {
    val source = ImageDecoder.createSource(resolver, uri)
    return ImageDecoder.decodeBitmap(source) { decoder, info, _ ->
      val (targetWidth, targetHeight) =
        PdfLayout.sampledSize(
          sourceWidth = info.size.width,
          sourceHeight = info.size.height,
          maximumWidth = maximumWidth,
          maximumHeight = maximumHeight,
        )
      decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
      decoder.setTargetSize(targetWidth, targetHeight)
    }
  }

  @Suppress("DEPRECATION")
  private fun loadWithBitmapFactory(
    resolver: ContentResolver,
    uri: Uri,
    requestedWidth: Int,
    requestedHeight: Int,
  ): Bitmap {
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use {
      BitmapFactory.decodeStream(it, null, bounds)
      Unit
    } ?: throw FileNotFoundException("이미지를 열 수 없습니다.")
    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
      throw IllegalArgumentException("지원하지 않는 이미지 형식입니다.")
    }

    val (targetWidth, targetHeight) =
      PdfLayout.sampledSize(
        sourceWidth = bounds.outWidth,
        sourceHeight = bounds.outHeight,
        maximumWidth = requestedWidth,
        maximumHeight = requestedHeight,
      )
    val options =
      BitmapFactory.Options().apply {
        inSampleSize =
          PdfLayout.bitmapSampleSize(
            sourceWidth = bounds.outWidth,
            sourceHeight = bounds.outHeight,
            requestedWidth = targetWidth,
            requestedHeight = targetHeight,
          )
        inPreferredConfig = Bitmap.Config.ARGB_8888
      }
    val decoded =
      resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, options) }
        ?: throw FileNotFoundException("이미지를 읽을 수 없습니다.")
    val oriented = applyExifOrientation(resolver, uri, decoded)
    val (finalWidth, finalHeight) =
      PdfLayout.sampledSize(
        sourceWidth = oriented.width,
        sourceHeight = oriented.height,
        maximumWidth = requestedWidth,
        maximumHeight = requestedHeight,
      )
    if (oriented.width == finalWidth && oriented.height == finalHeight) return oriented

    return try {
      Bitmap.createScaledBitmap(oriented, finalWidth, finalHeight, true).also {
        if (it !== oriented) oriented.recycle()
      }
    } catch (throwable: Throwable) {
      oriented.recycle()
      throw throwable
    }
  }

  private fun applyExifOrientation(
    resolver: ContentResolver,
    uri: Uri,
    bitmap: Bitmap,
  ): Bitmap {
    val orientation =
      runCatching {
          resolver.openInputStream(uri)?.use { input ->
            ExifInterface(input)
              .getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL,
              )
          }
        }
        .getOrDefault(ExifInterface.ORIENTATION_NORMAL)

    val matrix = Matrix()
    when (orientation) {
      ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.setScale(-1f, 1f)
      ExifInterface.ORIENTATION_ROTATE_180 -> matrix.setRotate(180f)
      ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.setScale(1f, -1f)
      ExifInterface.ORIENTATION_TRANSPOSE -> {
        matrix.setRotate(90f)
        matrix.postScale(-1f, 1f)
      }
      ExifInterface.ORIENTATION_ROTATE_90 -> matrix.setRotate(90f)
      ExifInterface.ORIENTATION_TRANSVERSE -> {
        matrix.setRotate(-90f)
        matrix.postScale(-1f, 1f)
      }
      ExifInterface.ORIENTATION_ROTATE_270 -> matrix.setRotate(-90f)
      else -> return bitmap
    }

    return try {
      Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true).also {
        if (it !== bitmap) bitmap.recycle()
      }
    } catch (throwable: Throwable) {
      bitmap.recycle()
      throw throwable
    }
  }
}
