package com.kdocumenttool.pdf

import android.net.Uri
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStore
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class MainScreenViewModelTest {
  @Test
  fun savedState_restoresPendingImagesAndOptionsBeforeDocumentResultReturns() = runTest {
    Dispatchers.setMain(StandardTestDispatcher(testScheduler))
    try {
      val savedState = SavedStateHandle()
      val firstGrantManager = RecordingUriGrantManager()
      val first =
        MainScreenViewModel(
          pdfCreator = RecordingPdfCreator(),
          savedStateHandle = savedState,
          uriGrantManager = firstGrantManager,
        )
      val firstImage = Uri.parse("content://images/first")
      val secondImage = Uri.parse("content://images/second")

      first.addImages(listOf(firstImage, secondImage))
      first.setOrientation(PageOrientation.LANDSCAPE)
      first.setMargin(MarginPreset.NARROW)

      assertEquals(listOf(firstImage, secondImage), firstGrantManager.persisted)

      val recreatedCreator = RecordingPdfCreator()
      val recreated =
        MainScreenViewModel(
          pdfCreator = recreatedCreator,
          savedStateHandle = savedState,
          uriGrantManager = RecordingUriGrantManager(),
        )
      assertEquals(2, recreated.uiState.value.images.size)
      assertEquals(PageOrientation.LANDSCAPE, recreated.uiState.value.options.orientation)
      assertEquals(MarginPreset.NARROW, recreated.uiState.value.options.margin)

      val destination = Uri.parse("content://documents/output")
      recreated.createPdf(destination)
      advanceUntilIdle()

      assertEquals(destination, recreatedCreator.destination)
      assertEquals(listOf(firstImage.toString(), secondImage.toString()), recreatedCreator.imageUris)
      assertEquals(PdfOptions(PageOrientation.LANDSCAPE, MarginPreset.NARROW), recreatedCreator.options)
      assertSame(CreationStatus.Success, recreated.uiState.value.status)
    } finally {
      Dispatchers.resetMain()
    }
  }

  @Test
  fun removeImage_releasesOnlyItsPersistedReadGrant() {
    val grants = RecordingUriGrantManager()
    val viewModel =
      MainScreenViewModel(
        pdfCreator = RecordingPdfCreator(),
        savedStateHandle = SavedStateHandle(),
        uriGrantManager = grants,
      )
    val first = Uri.parse("content://images/first")
    val second = Uri.parse("content://images/second")
    viewModel.addImages(listOf(first, second))

    viewModel.removeImage(0)

    assertEquals(listOf(first), grants.released)
    assertEquals(listOf(second.toString()), viewModel.uiState.value.images.map(SelectedImage::uri))
    assertTrue(viewModel.uiState.value.status is CreationStatus.Info)
  }

  @Test
  fun failedPersistableGrant_requiresReselectionAfterProcessRecreation() = runTest {
    Dispatchers.setMain(StandardTestDispatcher(testScheduler))
    try {
      val savedState = SavedStateHandle()
      val failingGrants = RecordingUriGrantManager(allowPersistence = false)
      val first =
        MainScreenViewModel(
          RecordingPdfCreator(),
          savedState,
          failingGrants,
        )
      first.addImages(listOf(Uri.parse("content://images/transient")))
      assertEquals(1, first.uiState.value.images.size)

      val recreatedCreator = RecordingPdfCreator()
      val recreated =
        MainScreenViewModel(
          recreatedCreator,
          savedState,
          RecordingUriGrantManager(),
        )
      assertTrue(recreated.uiState.value.requiresReselection)
      assertTrue(recreated.uiState.value.images.isEmpty())
      assertTrue(recreated.uiState.value.status is CreationStatus.Info)

      recreated.createPdf(Uri.parse("content://documents/empty-output"))
      advanceUntilIdle()

      assertTrue(recreated.uiState.value.status is CreationStatus.Error)
      assertTrue(recreatedCreator.imageUris.isEmpty())
    } finally {
      Dispatchers.resetMain()
    }
  }

  @Test
  fun mixedGrantBatches_keepReselectionWarningUntilTransientImageIsRemoved() {
    val savedState = SavedStateHandle()
    val grants = SelectiveUriGrantManager()
    val viewModel =
      MainScreenViewModel(
        RecordingPdfCreator(),
        savedState,
        grants,
      )
    val transient = Uri.parse("content://images/transient")
    val durable = Uri.parse("content://images/durable")

    grants.allowed = false
    viewModel.addImages(listOf(transient))
    grants.allowed = true
    viewModel.addImages(listOf(durable))

    val withTransient =
      MainScreenViewModel(
        RecordingPdfCreator(),
        savedState,
        RecordingUriGrantManager(),
      )
    assertTrue(withTransient.uiState.value.requiresReselection)
    assertEquals(listOf(durable.toString()), withTransient.uiState.value.images.map(SelectedImage::uri))

    viewModel.removeImage(0)
    val afterRemoval =
      MainScreenViewModel(
        RecordingPdfCreator(),
        savedState,
        RecordingUriGrantManager(),
      )
    assertTrue(!afterRemoval.uiState.value.requiresReselection)
    assertEquals(listOf(durable.toString()), afterRemoval.uiState.value.images.map(SelectedImage::uri))
  }

  @Test
  fun pendingOutput_isFlaggedWithoutDeletingPossiblyCompletedFileAfterProcessRecreation() = runTest {
    Dispatchers.setMain(StandardTestDispatcher(testScheduler))
    try {
      val destination = Uri.parse("content://documents/incomplete")
      val savedState = SavedStateHandle(mapOf("pending_destination" to destination.toString()))
      val recreated =
        MainScreenViewModel(
          RecordingPdfCreator(),
          savedState,
          RecordingUriGrantManager(),
        )
      advanceUntilIdle()

      assertTrue(recreated.uiState.value.status is CreationStatus.Error)
      assertEquals(null, savedState.get<String>("pending_destination"))
    } finally {
      Dispatchers.resetMain()
    }
  }

  @Test
  fun revokedPersistedGrant_isDroppedAndRequiresReselectionOnRecreation() {
    val savedState =
      SavedStateHandle(
        mapOf(
          "image_uris" to arrayListOf("content://images/revoked"),
          "access_may_expire" to false,
        )
      )

    val recreated =
      MainScreenViewModel(
        RecordingPdfCreator(),
        savedState,
        RecordingUriGrantManager(allowPersistence = false),
      )

    assertTrue(recreated.uiState.value.images.isEmpty())
    assertTrue(recreated.uiState.value.requiresReselection)
    assertTrue(!recreated.uiState.value.canSave)
  }

  @Test
  fun duplicateSelection_doesNotDismissRestoredReselectionWarning() {
    val savedState =
      SavedStateHandle(
        mapOf(
          "image_uris" to arrayListOf("content://images/durable"),
          "access_may_expire" to true,
        )
      )
    val viewModel =
      MainScreenViewModel(
        RecordingPdfCreator(),
        savedState,
        RecordingUriGrantManager(),
      )

    viewModel.addImages(listOf(Uri.parse("content://images/durable")))

    assertTrue(viewModel.uiState.value.requiresReselection)
    assertTrue(!viewModel.uiState.value.canSave)
  }

  @Test
  fun generatingState_blocksMutationsCancellationNoticeAndDuplicateSave() = runTest {
    Dispatchers.setMain(StandardTestDispatcher(testScheduler))
    try {
      val creator = BlockingPdfCreator()
      val viewModel =
        MainScreenViewModel(
          creator,
          SavedStateHandle(),
          RecordingUriGrantManager(),
        )
      val first = Uri.parse("content://images/first")
      val second = Uri.parse("content://images/second")
      viewModel.addImages(listOf(first, second))
      val stateBeforeSave = viewModel.uiState.value
      val destination = Uri.parse("content://documents/first-output")

      viewModel.createPdf(destination)
      runCurrent()
      assertTrue(viewModel.uiState.value.isGenerating)

      viewModel.addImages(listOf(Uri.parse("content://images/third")))
      viewModel.removeImage(0)
      viewModel.moveImage(0, 1)
      viewModel.setOrientation(PageOrientation.LANDSCAPE)
      viewModel.setMargin(MarginPreset.NARROW)
      viewModel.onSaveCancelled()
      viewModel.createPdf(Uri.parse("content://documents/duplicate-output"))

      assertEquals(stateBeforeSave.images, viewModel.uiState.value.images)
      assertEquals(stateBeforeSave.options, viewModel.uiState.value.options)
      assertTrue(viewModel.uiState.value.status is CreationStatus.Generating)
      assertEquals(1, creator.invocations)
      assertEquals(destination, creator.destination)

      creator.release.complete(Unit)
      advanceUntilIdle()
      assertSame(CreationStatus.Success, viewModel.uiState.value.status)
    } finally {
      Dispatchers.resetMain()
    }
  }

  @Test
  fun saveCancellation_reportsRecoverableInformationWhenIdle() {
    val viewModel =
      MainScreenViewModel(
        RecordingPdfCreator(),
        SavedStateHandle(),
        RecordingUriGrantManager(),
      )

    viewModel.onSaveCancelled()

    val status = viewModel.uiState.value.status as CreationStatus.Info
    assertTrue(status.message.contains("취소"))
  }

  @Test
  fun blankCreatorFailure_usesFallbackMessageAndClearsPendingDestination() = runTest {
    Dispatchers.setMain(StandardTestDispatcher(testScheduler))
    try {
      val savedState = SavedStateHandle()
      val viewModel =
        MainScreenViewModel(
          ThrowingPdfCreator(IllegalStateException("   ")),
          savedState,
          RecordingUriGrantManager(),
        )
      viewModel.addImages(listOf(Uri.parse("content://images/first")))

      viewModel.createPdf(Uri.parse("content://documents/failing-output"))
      advanceUntilIdle()

      val status = viewModel.uiState.value.status as CreationStatus.Error
      assertEquals("PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", status.message)
      assertEquals(null, savedState.get<String>("pending_destination"))
    } finally {
      Dispatchers.resetMain()
    }
  }

  @Test
  fun creatorCancellation_returnsToReadyAndClearsPendingDestination() = runTest {
    Dispatchers.setMain(StandardTestDispatcher(testScheduler))
    try {
      val savedState = SavedStateHandle()
      val viewModel =
        MainScreenViewModel(
          ThrowingPdfCreator(CancellationException("test cancellation")),
          savedState,
          RecordingUriGrantManager(),
        )
      viewModel.addImages(listOf(Uri.parse("content://images/first")))

      viewModel.createPdf(Uri.parse("content://documents/cancelled-output"))
      advanceUntilIdle()

      assertSame(CreationStatus.Ready, viewModel.uiState.value.status)
      assertEquals(null, savedState.get<String>("pending_destination"))
    } finally {
      Dispatchers.resetMain()
    }
  }

  @Test
  fun malformedSavedOptions_fallBackToDefaultsAndSavedImagesAreDeduplicatedAndCapped() {
    val savedImages =
      arrayListOf("content://images/duplicate", "content://images/duplicate")
        .apply { addAll((1..20).map { "content://images/$it" }) }
    val savedState =
      SavedStateHandle(
        mapOf(
          "image_uris" to savedImages,
          "page_orientation" to "DIAGONAL",
          "margin_preset" to "HUGE",
        )
      )

    val viewModel =
      MainScreenViewModel(
        RecordingPdfCreator(),
        savedState,
        RecordingUriGrantManager(),
      )

    assertEquals(MAX_IMAGE_COUNT, viewModel.uiState.value.images.size)
    assertEquals(MAX_IMAGE_COUNT, viewModel.uiState.value.images.distinct().size)
    assertEquals(PageOrientation.PORTRAIT, viewModel.uiState.value.options.orientation)
    assertEquals(MarginPreset.NORMAL, viewModel.uiState.value.options.margin)
  }

  @Test
  fun clearingViewModelStore_releasesEverySelectedPersistedReadGrant() {
    val grants = RecordingUriGrantManager()
    val store = ViewModelStore()
    val factory =
      object : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
          MainScreenViewModel(
            RecordingPdfCreator(),
            SavedStateHandle(),
            grants,
          ) as T
      }
    val viewModel = ViewModelProvider.create(store, factory)[MainScreenViewModel::class.java]
    val first = Uri.parse("content://images/first")
    val second = Uri.parse("content://images/second")
    viewModel.addImages(listOf(first, second))

    store.clear()

    assertEquals(listOf(first, second), grants.released)
  }
}

private class RecordingPdfCreator : PdfCreator {
  var destination: Uri? = null
  var imageUris: List<String> = emptyList()
  var options: PdfOptions? = null

  override suspend fun create(
    destination: Uri,
    images: List<SelectedImage>,
    options: PdfOptions,
    onProgress: (completed: Int, total: Int) -> Unit,
  ) {
    if (images.isEmpty()) throw PdfCreationException("이미지를 다시 선택해 주세요.")
    this.destination = destination
    imageUris = images.map(SelectedImage::uri)
    this.options = options
    onProgress(images.size, images.size)
  }
}

private class BlockingPdfCreator : PdfCreator {
  val release = CompletableDeferred<Unit>()
  var invocations = 0
  var destination: Uri? = null

  override suspend fun create(
    destination: Uri,
    images: List<SelectedImage>,
    options: PdfOptions,
    onProgress: (completed: Int, total: Int) -> Unit,
  ) {
    invocations += 1
    this.destination = destination
    release.await()
    onProgress(images.size, images.size)
  }
}

private class ThrowingPdfCreator(private val throwable: Throwable) : PdfCreator {
  override suspend fun create(
    destination: Uri,
    images: List<SelectedImage>,
    options: PdfOptions,
    onProgress: (completed: Int, total: Int) -> Unit,
  ) {
    throw throwable
  }
}

private class RecordingUriGrantManager(private val allowPersistence: Boolean = true) : UriGrantManager {
  val persisted = mutableListOf<Uri>()
  val released = mutableListOf<Uri>()

  override fun persistReadAccess(uris: List<Uri>): Set<Uri> {
    persisted += uris
    return if (allowPersistence) uris.toSet() else emptySet()
  }

  override fun releaseReadAccess(uri: Uri) {
    released += uri
  }
}

private class SelectiveUriGrantManager : UriGrantManager {
  var allowed = true

  override fun persistReadAccess(uris: List<Uri>): Set<Uri> =
    if (allowed) uris.toSet() else emptySet()

  override fun releaseReadAccess(uri: Uri) = Unit
}
