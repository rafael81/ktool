package com.kdocumenttool.pdf

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class PdfModelsTest {
  @Test
  fun addImages_removesDuplicatesAndCapsListAtTen() {
    val initial = PdfUiState(images = listOf(SelectedImage("content://image/existing")))
    val incoming =
      listOf("content://image/existing") +
        (1..25).map { "content://image/$it" } +
        listOf("content://image/1")

    val result = PdfEditor.addImages(initial, incoming)

    assertEquals(MAX_IMAGE_COUNT, result.images.size)
    assertEquals(MAX_IMAGE_COUNT, result.images.map(SelectedImage::uri).distinct().size)
    assertEquals("content://image/existing", result.images.first().uri)
    assertTrue(result.status is CreationStatus.Info)
    assertTrue((result.status as CreationStatus.Info).message.contains("최대 10장"))
  }

  @Test
  fun addImages_reportsWhyASelectionAddsNothing() {
    val existing = PdfUiState(images = listOf(SelectedImage("content://image/existing")))

    val duplicateOnly =
      PdfEditor.addImages(
        existing,
        listOf("", "   ", "content://image/existing", "content://image/existing"),
      )
    val full =
      PdfUiState(images = (1..MAX_IMAGE_COUNT).map { SelectedImage("content://image/$it") })
    val overCapacity = PdfEditor.addImages(full, listOf("content://image/new"))

    assertEquals(existing.images, duplicateOnly.images)
    assertTrue((duplicateOnly.status as CreationStatus.Info).message.contains("이미 추가된"))
    assertEquals(full.images, overCapacity.images)
    assertTrue((overCapacity.status as CreationStatus.Info).message.contains("최대 10장"))
  }

  @Test
  fun moveAndRemoveImage_preserveExpectedPageOrder() {
    val initial =
      PdfUiState(
        images =
          listOf(
            SelectedImage("content://image/first"),
            SelectedImage("content://image/second"),
            SelectedImage("content://image/third"),
          )
      )

    val moved = PdfEditor.moveImage(initial, fromIndex = 2, toIndex = 0)
    val removed = PdfEditor.removeImage(moved, index = 1)

    assertEquals(
      listOf("content://image/third", "content://image/second"),
      removed.images.map(SelectedImage::uri),
    )
  }

  @Test
  fun invalidMoveAndRemove_leaveEditorStateUnchanged() {
    val initial =
      PdfUiState(
        images =
          listOf(
            SelectedImage("content://image/first"),
            SelectedImage("content://image/second"),
          ),
        status = CreationStatus.Info("기존 상태"),
      )

    assertEquals(initial, PdfEditor.removeImage(initial, -1))
    assertEquals(initial, PdfEditor.removeImage(initial, initial.images.size))
    assertEquals(initial, PdfEditor.moveImage(initial, -1, 0))
    assertEquals(initial, PdfEditor.moveImage(initial, 0, initial.images.size))
    assertEquals(initial, PdfEditor.moveImage(initial, 1, 1))
  }

  @Test
  fun uiState_disablesSaveWhileGeneratingOrWhenSelectionMustBeRestored() {
    val ready = PdfUiState(images = listOf(SelectedImage("content://image/ready")))
    val generating =
      ready.copy(status = CreationStatus.Generating(completed = 0, total = 0))
    val requiresReselection = ready.copy(requiresReselection = true)

    assertTrue(ready.canSave)
    assertTrue(!generating.canSave)
    assertTrue(!requiresReselection.canSave)
    assertEquals(0f, (generating.status as CreationStatus.Generating).fraction)
  }

  @Test
  fun pageGeometry_usesA4PointsAndSelectedMargins() {
    val portrait =
      PdfLayout.pageGeometry(
        PdfOptions(PageOrientation.PORTRAIT, MarginPreset.NORMAL)
      )
    val landscape =
      PdfLayout.pageGeometry(
        PdfOptions(PageOrientation.LANDSCAPE, MarginPreset.NARROW)
      )

    assertEquals(PageGeometry(width = 595, height = 842, margin = 36), portrait)
    assertEquals(PageGeometry(width = 842, height = 595, margin = 18), landscape)
  }

  @Test
  fun fitCenter_scalesWithoutCroppingAndCentersInContentArea() {
    val page = PageGeometry(width = 595, height = 842, margin = 36)

    val fitted = PdfLayout.fitCenter(sourceWidth = 100, sourceHeight = 200, page = page)

    assertEquals(385f, fitted.width, 0.01f)
    assertEquals(770f, fitted.height, 0.01f)
    assertEquals(105f, fitted.left, 0.01f)
    assertEquals(36f, fitted.top, 0.01f)
  }

  @Test
  fun sampledSize_neverUpscalesAndBitmapSampleIsPowerOfTwo() {
    assertEquals(800 to 600, PdfLayout.sampledSize(800, 600, 1200, 1200))
    assertEquals(1046 to 784, PdfLayout.sampledSize(4000, 3000, 1046, 1540))
    assertEquals(2, PdfLayout.bitmapSampleSize(4000, 3000, 1046, 784))
  }

  @Test
  fun layout_rejectsNonPositiveImageAndContentDimensions() {
    assertThrows(IllegalArgumentException::class.java) {
      PdfLayout.fitCenter(sourceWidth = 0, sourceHeight = 100, page = PageGeometry(595, 842, 36))
    }
    assertThrows(IllegalArgumentException::class.java) {
      PdfLayout.fitCenter(sourceWidth = 100, sourceHeight = 100, page = PageGeometry(10, 10, 5))
    }
    assertThrows(IllegalArgumentException::class.java) {
      PdfLayout.sampledSize(100, 0, maximumWidth = 100, maximumHeight = 100)
    }
  }
}
