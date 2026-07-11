package com.kdocumenttool.pdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import androidx.test.core.app.ApplicationProvider
import androidx.test.filters.SdkSuppress
import java.io.File
import java.io.FileOutputStream
import kotlin.math.abs
import org.junit.Assert.assertEquals
import org.junit.Test

@SdkSuppress(minSdkVersion = 24, maxSdkVersion = 27)
class PlatformImageLoaderLegacyTest {
  @Test
  fun bitmapFactory_appliesExifOrientationsTwoThroughEight() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val input = File(context.cacheDir, "legacy-exif-orientation.jpg")
    try {
      EXIF_EXPECTATIONS.forEach { (orientation, expectation) ->
        writeQuadrantImage(input, orientation)
        val decoded =
          PlatformImageLoader.loadForPdf(
            resolver = context.contentResolver,
            uri = Uri.fromFile(input),
            maximumWidth = 800,
            maximumHeight = 800,
          )
        try {
          assertEquals(expectation.width, decoded.width)
          assertEquals(expectation.height, decoded.height)
          assertEquals(expectation.quadrants, decoded.quadrants())
        } finally {
          decoded.recycle()
        }
      }
    } finally {
      input.delete()
    }
  }

  private fun writeQuadrantImage(file: File, orientation: Int) {
    val bitmap = Bitmap.createBitmap(SOURCE_WIDTH, SOURCE_HEIGHT, Bitmap.Config.ARGB_8888)
    try {
      val canvas = Canvas(bitmap)
      val paint = Paint()
      QUADRANT_COLORS.forEachIndexed { index, color ->
        paint.color = color
        val left = if (index % 2 == 0) 0f else SOURCE_WIDTH / 2f
        val top = if (index < 2) 0f else SOURCE_HEIGHT / 2f
        canvas.drawRect(left, top, left + SOURCE_WIDTH / 2f, top + SOURCE_HEIGHT / 2f, paint)
      }
      FileOutputStream(file).use { output ->
        check(bitmap.compress(Bitmap.CompressFormat.JPEG, 95, output))
      }
      ExifInterface(file.absolutePath).apply {
        setAttribute(ExifInterface.TAG_ORIENTATION, orientation.toString())
        saveAttributes()
      }
    } finally {
      bitmap.recycle()
    }
  }

  private fun Bitmap.quadrants(): List<Int> =
    listOf(
        getPixel(width / 4, height / 4),
        getPixel(width * 3 / 4, height / 4),
        getPixel(width / 4, height * 3 / 4),
        getPixel(width * 3 / 4, height * 3 / 4),
      )
      .map(::nearestQuadrantColor)

  private fun nearestQuadrantColor(pixel: Int): Int =
    QUADRANT_COLORS.indices.minBy { index ->
      val reference = QUADRANT_COLORS[index]
      abs(Color.red(pixel) - Color.red(reference)) +
        abs(Color.green(pixel) - Color.green(reference)) +
        abs(Color.blue(pixel) - Color.blue(reference))
    }

  private data class OrientationExpectation(
    val width: Int,
    val height: Int,
    val quadrants: List<Int>,
  )

  private companion object {
    const val SOURCE_WIDTH = 400
    const val SOURCE_HEIGHT = 240
    val QUADRANT_COLORS =
      listOf(
        Color.rgb(220, 30, 30),
        Color.rgb(30, 220, 30),
        Color.rgb(30, 30, 220),
        Color.rgb(220, 220, 30),
      )
    val EXIF_EXPECTATIONS =
      mapOf(
        ExifInterface.ORIENTATION_FLIP_HORIZONTAL to
          OrientationExpectation(SOURCE_WIDTH, SOURCE_HEIGHT, listOf(1, 0, 3, 2)),
        ExifInterface.ORIENTATION_ROTATE_180 to
          OrientationExpectation(SOURCE_WIDTH, SOURCE_HEIGHT, listOf(3, 2, 1, 0)),
        ExifInterface.ORIENTATION_FLIP_VERTICAL to
          OrientationExpectation(SOURCE_WIDTH, SOURCE_HEIGHT, listOf(2, 3, 0, 1)),
        ExifInterface.ORIENTATION_TRANSPOSE to
          OrientationExpectation(SOURCE_HEIGHT, SOURCE_WIDTH, listOf(0, 2, 1, 3)),
        ExifInterface.ORIENTATION_ROTATE_90 to
          OrientationExpectation(SOURCE_HEIGHT, SOURCE_WIDTH, listOf(2, 0, 3, 1)),
        ExifInterface.ORIENTATION_TRANSVERSE to
          OrientationExpectation(SOURCE_HEIGHT, SOURCE_WIDTH, listOf(3, 1, 2, 0)),
        ExifInterface.ORIENTATION_ROTATE_270 to
          OrientationExpectation(SOURCE_HEIGHT, SOURCE_WIDTH, listOf(1, 3, 0, 2)),
      )
  }
}
