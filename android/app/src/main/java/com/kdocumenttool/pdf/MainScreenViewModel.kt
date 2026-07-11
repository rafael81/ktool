package com.kdocumenttool.pdf

import android.net.Uri
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class MainScreenViewModel(
  private val pdfCreator: PdfCreator,
  private val savedStateHandle: SavedStateHandle,
  private val uriGrantManager: UriGrantManager,
) : ViewModel() {
  private val restoredState = restoreState(savedStateHandle, uriGrantManager)
  private val durableUriStrings = restoredState.images.mapTo(mutableSetOf(), SelectedImage::uri)
  private val _uiState = MutableStateFlow(restoredState)
  val uiState: StateFlow<PdfUiState> = _uiState.asStateFlow()

  init {
    persistState(restoredState)
    cleanUpOutputInterruptedByProcessDeath()
  }

  fun addImages(uris: List<Uri>) {
    if (_uiState.value.isGenerating) return
    val current = _uiState.value
    val updated = PdfEditor.addImages(current, uris.map(Uri::toString))
    val existingUris = current.images.mapTo(mutableSetOf(), SelectedImage::uri)
    val acceptedUris =
      updated.images.map(SelectedImage::uri).filterNot(existingUris::contains).map(Uri::parse)
    val persistedUris = uriGrantManager.persistReadAccess(acceptedUris).mapTo(mutableSetOf()) { it.toString() }
    durableUriStrings += persistedUris
    val readyState =
      updated.copy(
        requiresReselection = current.requiresReselection && acceptedUris.isEmpty(),
      )
    _uiState.value = readyState
    persistState(readyState)
  }

  fun removeImage(index: Int) {
    if (_uiState.value.isGenerating) return
    val removedUri = _uiState.value.images.getOrNull(index)?.uri
    updateState { PdfEditor.removeImage(it, index) }
    removedUri?.let {
      durableUriStrings -= it
      uriGrantManager.releaseReadAccess(Uri.parse(it))
      persistState(_uiState.value)
    }
  }

  fun moveImage(fromIndex: Int, toIndex: Int) {
    if (_uiState.value.isGenerating) return
    updateState { PdfEditor.moveImage(it, fromIndex, toIndex) }
  }

  fun setOrientation(orientation: PageOrientation) {
    if (_uiState.value.isGenerating) return
    updateState {
      it.copy(
        options = it.options.copy(orientation = orientation),
        status = CreationStatus.Ready,
      )
    }
  }

  fun setMargin(margin: MarginPreset) {
    if (_uiState.value.isGenerating) return
    updateState {
      it.copy(options = it.options.copy(margin = margin), status = CreationStatus.Ready)
    }
  }

  fun onSaveCancelled() {
    if (_uiState.value.isGenerating) return
    _uiState.update { it.copy(status = CreationStatus.Info("PDF 저장을 취소했습니다.")) }
  }

  fun createPdf(destination: Uri) {
    val request = _uiState.value
    if (request.isGenerating) return

    val requestImages = if (request.requiresReselection) emptyList() else request.images
    savedStateHandle[KEY_PENDING_DESTINATION] = destination.toString()
    _uiState.update {
      it.copy(status = CreationStatus.Generating(completed = 0, total = requestImages.size))
    }
    viewModelScope.launch {
      try {
        pdfCreator.create(
          destination = destination,
          images = requestImages,
          options = request.options,
          onProgress = { completed, total ->
            _uiState.update {
              it.copy(status = CreationStatus.Generating(completed, total))
            }
          },
        )
        clearPendingDestination(destination)
        _uiState.update { it.copy(status = CreationStatus.Success) }
      } catch (cancellation: CancellationException) {
        clearPendingDestination(destination)
        _uiState.update { it.copy(status = CreationStatus.Ready) }
        throw cancellation
      } catch (throwable: Throwable) {
        clearPendingDestination(destination)
        val message =
          throwable.message?.takeIf(String::isNotBlank)
            ?: "PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요."
        _uiState.update { it.copy(status = CreationStatus.Error(message)) }
      }
    }
  }

  override fun onCleared() {
    _uiState.value.images.forEach { image ->
      uriGrantManager.releaseReadAccess(Uri.parse(image.uri))
    }
    super.onCleared()
  }

  private fun updateState(transform: (PdfUiState) -> PdfUiState) {
    _uiState.update { current -> transform(current).also(::persistState) }
  }

  private fun persistState(state: PdfUiState) {
    savedStateHandle[KEY_IMAGE_URIS] =
      ArrayList(state.images.map(SelectedImage::uri).filter(durableUriStrings::contains))
    savedStateHandle[KEY_ORIENTATION] = state.options.orientation.name
    savedStateHandle[KEY_MARGIN] = state.options.margin.name
    savedStateHandle[KEY_ACCESS_MAY_EXPIRE] =
      state.requiresReselection || state.images.any { image -> image.uri !in durableUriStrings }
  }

  private fun cleanUpOutputInterruptedByProcessDeath() {
    val pendingDestination =
      savedStateHandle.get<String>(KEY_PENDING_DESTINATION)?.let(Uri::parse) ?: return
    // A process can die just after writeTo() succeeds but before this key is cleared. Deleting the
    // URI on restart could therefore remove a valid PDF, and the temporary SAF write grant may no
    // longer exist. Report the ambiguous file so the user can verify it instead.
    clearPendingDestination(pendingDestination)
    _uiState.update { current ->
      current.copy(
        status =
          CreationStatus.Error(
            if (current.requiresReselection) {
              "이전 PDF 저장이 완료되지 않았을 수 있습니다. 저장 위치의 파일을 확인하고 이미지를 다시 선택해 주세요."
            } else {
              "이전 PDF 저장이 완료되지 않았을 수 있습니다. 저장 위치에서 불완전 파일을 확인해 주세요."
            }
          )
      )
    }
  }

  private fun clearPendingDestination(destination: Uri) {
    if (savedStateHandle.get<String>(KEY_PENDING_DESTINATION) == destination.toString()) {
      savedStateHandle[KEY_PENDING_DESTINATION] = null
    }
  }

  private companion object {
    const val KEY_IMAGE_URIS = "image_uris"
    const val KEY_ORIENTATION = "page_orientation"
    const val KEY_MARGIN = "margin_preset"
    const val KEY_ACCESS_MAY_EXPIRE = "access_may_expire"
    const val KEY_PENDING_DESTINATION = "pending_destination"

    fun restoreState(
      savedStateHandle: SavedStateHandle,
      uriGrantManager: UriGrantManager,
    ): PdfUiState {
      val savedImages =
        savedStateHandle
          .get<ArrayList<String>>(KEY_IMAGE_URIS)
          .orEmpty()
          .distinct()
          .take(MAX_IMAGE_COUNT)
          .map(::SelectedImage)
      val verifiedUris =
        uriGrantManager
          .persistReadAccess(savedImages.map { image -> Uri.parse(image.uri) })
          .mapTo(mutableSetOf(), Uri::toString)
      val images = savedImages.filter { image -> image.uri in verifiedUris }
      val orientation =
        savedStateHandle.get<String>(KEY_ORIENTATION)?.let { saved ->
          PageOrientation.entries.firstOrNull { it.name == saved }
        } ?: PageOrientation.PORTRAIT
      val margin =
        savedStateHandle.get<String>(KEY_MARGIN)?.let { saved ->
          MarginPreset.entries.firstOrNull { it.name == saved }
        } ?: MarginPreset.NORMAL
      val requiresReselection =
        (savedStateHandle[KEY_ACCESS_MAY_EXPIRE] ?: false) || images.size < savedImages.size
      return PdfUiState(
        images = images,
        options = PdfOptions(orientation, margin),
        status =
          if (requiresReselection) {
            CreationStatus.Info("일부 이미지 접근이 만료되었습니다. 이미지를 다시 선택해 주세요.")
          } else {
            CreationStatus.Ready
          },
        requiresReselection = requiresReselection,
      )
    }
  }
}
