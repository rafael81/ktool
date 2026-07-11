package com.kdocumenttool.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import androidx.exifinterface.media.ExifInterface
import androidx.test.core.app.ApplicationProvider
import java.io.File
import java.io.FileOutputStream
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AndroidPdfCreatorTest {
  @Test
  fun create_writesTenReadableA4PagesWithinTheMobilePageBudget() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val inputDirectory = File(context.cacheDir, "pdf-test-inputs").apply { mkdirs() }
    val output = File(context.cacheDir, "ten-page-output.pdf")
    val inputs =
      (1..MAX_IMAGE_COUNT).map { pageNumber ->
        File(inputDirectory, "page-$pageNumber.jpg").also { file ->
          writeTestImage(file, pageNumber)
        }
      }

    try {
      var completedPages = 0
      AndroidPdfCreator(context).create(
        destination = Uri.fromFile(output),
        images = inputs.map { SelectedImage(Uri.fromFile(it).toString()) },
        options = PdfOptions(),
        onProgress = { completed, _ -> completedPages = completed },
      )

      assertTrue(output.isFile)
      assertTrue(output.length() > 0L)
      assertEquals(MAX_IMAGE_COUNT, completedPages)
      ParcelFileDescriptor.open(output, ParcelFileDescriptor.MODE_READ_ONLY).use { descriptor ->
        PdfRenderer(descriptor).use { renderer ->
          assertEquals(MAX_IMAGE_COUNT, renderer.pageCount)
          renderer.openPage(0).use { firstPage ->
            assertEquals(595, firstPage.width)
            assertEquals(842, firstPage.height)
            val rendered =
              Bitmap.createBitmap(firstPage.width, firstPage.height, Bitmap.Config.ARGB_8888)
            try {
              Canvas(rendered).drawColor(Color.WHITE)
              firstPage.render(
                rendered,
                null,
                null,
                PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY,
              )
              assertTrue(rendered.getPixel(firstPage.width / 2, firstPage.height / 2) != Color.WHITE)
            } finally {
              rendered.recycle()
            }
          }
        }
      }
    } finally {
      output.delete()
      inputs.forEach(File::delete)
      inputDirectory.delete()
    }
  }

  @Test
  fun create_rejectsEmptyInputAndRemovesOrTruncatesTheDestination() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val output = File(context.cacheDir, "empty-input-output.pdf").apply { writeText("partial") }

    try {
      val error =
        expectPdfCreationFailure {
          AndroidPdfCreator(context).create(
            destination = Uri.fromFile(output),
            images = emptyList(),
            options = PdfOptions(),
            onProgress = { _, _ -> },
          )
        }

      assertTrue(error.message.orEmpty().contains("이미지를 다시 선택"))
      assertTrue(!output.exists() || output.length() == 0L)
    } finally {
      output.delete()
    }
  }

  @Test
  fun create_reportsTheUnreadableImageIndexAndCleansPartialOutput() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val missingInput = File(context.cacheDir, "missing-input.jpg").apply { delete() }
    val output = File(context.cacheDir, "unreadable-input-output.pdf").apply { writeText("partial") }

    try {
      val error =
        expectPdfCreationFailure {
          AndroidPdfCreator(context).create(
            destination = Uri.fromFile(output),
            images = listOf(SelectedImage(Uri.fromFile(missingInput).toString())),
            options = PdfOptions(),
            onProgress = { _, _ -> },
          )
        }

      assertTrue(error.message.orEmpty().contains("1번째 이미지를 읽을 수 없습니다"))
      assertTrue(!output.exists() || output.length() == 0L)
    } finally {
      output.delete()
    }
  }

  @Test
  fun create_propagatesCancellationAndCleansTheDestination() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val input = File(context.cacheDir, "cancel-input.png")
    val output = File(context.cacheDir, "cancelled-output.pdf").apply { writeText("partial") }
    writeSolidImage(input, Color.RED)

    try {
      var cancellation: CancellationException? = null
      try {
        AndroidPdfCreator(context).create(
          destination = Uri.fromFile(output),
          images = listOf(SelectedImage(Uri.fromFile(input).toString())),
          options = PdfOptions(),
          onProgress = { _, _ -> throw CancellationException("test cancellation") },
        )
      } catch (caught: CancellationException) {
        cancellation = caught
      }

      assertEquals("test cancellation", cancellation?.message)
      assertTrue(!output.exists() || output.length() == 0L)
    } finally {
      input.delete()
      output.delete()
    }
  }

  @Test
  fun create_preservesImageOrderOnLandscapePagesWithoutMargins() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val redInput = File(context.cacheDir, "order-red.png")
    val blueInput = File(context.cacheDir, "order-blue.png")
    val output = File(context.cacheDir, "landscape-order-output.pdf")
    writeSolidImage(redInput, Color.RED)
    writeSolidImage(blueInput, Color.BLUE)

    try {
      AndroidPdfCreator(context).create(
        destination = Uri.fromFile(output),
        images =
          listOf(
            SelectedImage(Uri.fromFile(blueInput).toString()),
            SelectedImage(Uri.fromFile(redInput).toString()),
          ),
        options = PdfOptions(PageOrientation.LANDSCAPE, MarginPreset.NONE),
        onProgress = { _, _ -> },
      )

      ParcelFileDescriptor.open(output, ParcelFileDescriptor.MODE_READ_ONLY).use { descriptor ->
        PdfRenderer(descriptor).use { renderer ->
          assertEquals(2, renderer.pageCount)
          assertPageCenterColor(renderer, pageIndex = 0, expectedColor = Color.BLUE)
          assertPageCenterColor(renderer, pageIndex = 1, expectedColor = Color.RED)
        }
      }
    } finally {
      redInput.delete()
      blueInput.delete()
      output.delete()
    }
  }

  private fun writeTestImage(file: File, pageNumber: Int) {
    val bitmap = Bitmap.createBitmap(1800, 2600, Bitmap.Config.ARGB_8888)
    try {
      val canvas = Canvas(bitmap)
      canvas.drawColor(Color.rgb(235, 245, 243))
      val paint =
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
          color = Color.rgb(17, 122, 122)
          textSize = 220f
        }
      canvas.drawText("$pageNumber", 180f, 420f, paint)
      FileOutputStream(file).use { output ->
        check(bitmap.compress(Bitmap.CompressFormat.JPEG, 88, output))
      }
      if (pageNumber % 2 == 0) {
        ExifInterface(file.absolutePath).apply {
          setAttribute(
            ExifInterface.TAG_ORIENTATION,
            ExifInterface.ORIENTATION_ROTATE_90.toString(),
          )
          saveAttributes()
        }
      }
    } finally {
      bitmap.recycle()
    }
  }

  private fun writeSolidImage(file: File, color: Int) {
    val bitmap = Bitmap.createBitmap(1200, 600, Bitmap.Config.ARGB_8888)
    try {
      Canvas(bitmap).drawColor(color)
      FileOutputStream(file).use { output ->
        check(bitmap.compress(Bitmap.CompressFormat.PNG, 100, output))
      }
    } finally {
      bitmap.recycle()
    }
  }

  private fun assertPageCenterColor(renderer: PdfRenderer, pageIndex: Int, expectedColor: Int) {
    renderer.openPage(pageIndex).use { page ->
      assertEquals(842, page.width)
      assertEquals(595, page.height)
      val rendered = Bitmap.createBitmap(page.width, page.height, Bitmap.Config.ARGB_8888)
      try {
        Canvas(rendered).drawColor(Color.WHITE)
        page.render(rendered, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
        val actual = rendered.getPixel(page.width / 2, page.height / 2)
        if (expectedColor == Color.RED) {
          assertTrue(Color.red(actual) > Color.blue(actual) + 100)
        } else {
          assertTrue(Color.blue(actual) > Color.red(actual) + 100)
        }
      } finally {
        rendered.recycle()
      }
    }
  }

  private suspend fun expectPdfCreationFailure(block: suspend () -> Unit): PdfCreationException {
    try {
      block()
    } catch (error: PdfCreationException) {
      return error
    }
    throw AssertionError("Expected PdfCreationException")
  }
}
