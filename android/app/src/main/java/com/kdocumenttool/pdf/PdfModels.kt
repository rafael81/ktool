package com.kdocumenttool.pdf

import kotlin.math.min

const val MAX_IMAGE_COUNT = 10

data class SelectedImage(val uri: String)

enum class PageOrientation(val label: String) {
  PORTRAIT("세로"),
  LANDSCAPE("가로"),
}

enum class MarginPreset(val label: String, val description: String, val points: Int) {
  NORMAL("보통", "12.7 mm", 36),
  NARROW("좁게", "6.4 mm", 18),
  NONE("추가 여백 없음", "이미지 비율 유지", 0),
}

data class PdfOptions(
  val orientation: PageOrientation = PageOrientation.PORTRAIT,
  val margin: MarginPreset = MarginPreset.NORMAL,
)

sealed interface CreationStatus {
  data object Ready : CreationStatus

  data class Info(val message: String) : CreationStatus

  data class Generating(val completed: Int, val total: Int) : CreationStatus {
    val fraction: Float
      get() = if (total == 0) 0f else completed.toFloat() / total.toFloat()
  }

  data object Success : CreationStatus

  data class Error(val message: String) : CreationStatus
}

data class PdfUiState(
  val images: List<SelectedImage> = emptyList(),
  val options: PdfOptions = PdfOptions(),
  val status: CreationStatus = CreationStatus.Ready,
  val requiresReselection: Boolean = false,
) {
  val isGenerating: Boolean
    get() = status is CreationStatus.Generating

  val canSave: Boolean
    get() = images.isNotEmpty() && !isGenerating && !requiresReselection
}

/** Pure editor operations, kept separate from Android APIs so ordering and limits are easy to test. */
object PdfEditor {
  fun addImages(state: PdfUiState, imageUris: List<String>): PdfUiState {
    val existingUris = state.images.mapTo(mutableSetOf()) { it.uri }
    val candidates =
      imageUris
        .asSequence()
        .filter(String::isNotBlank)
        .distinct()
        .filterNot(existingUris::contains)
        .toList()
    val remaining = (MAX_IMAGE_COUNT - state.images.size).coerceAtLeast(0)
    val accepted = candidates.take(remaining).map(::SelectedImage)
    val updatedImages = state.images + accepted

    val message =
      when {
        accepted.isEmpty() && state.images.size == MAX_IMAGE_COUNT ->
          "이미지는 최대 ${MAX_IMAGE_COUNT}장까지 추가할 수 있습니다."
        accepted.isEmpty() -> "이미 추가된 이미지이거나 선택한 이미지가 없습니다."
        candidates.size > accepted.size ->
          "${accepted.size}장을 추가했습니다. 이미지는 최대 ${MAX_IMAGE_COUNT}장까지 사용할 수 있습니다."
        else -> "${accepted.size}장을 추가했습니다."
      }

    return state.copy(images = updatedImages, status = CreationStatus.Info(message))
  }

  fun removeImage(state: PdfUiState, index: Int): PdfUiState {
    if (index !in state.images.indices) return state
    return state.copy(
      images = state.images.filterIndexed { itemIndex, _ -> itemIndex != index },
      status = CreationStatus.Info("이미지를 목록에서 삭제했습니다."),
    )
  }

  fun moveImage(state: PdfUiState, fromIndex: Int, toIndex: Int): PdfUiState {
    if (fromIndex !in state.images.indices || toIndex !in state.images.indices || fromIndex == toIndex) {
      return state
    }
    val reordered = state.images.toMutableList()
    val image = reordered.removeAt(fromIndex)
    reordered.add(toIndex, image)
    return state.copy(
      images = reordered,
      status = CreationStatus.Info("이미지 순서를 변경했습니다."),
    )
  }
}

data class PageGeometry(val width: Int, val height: Int, val margin: Int) {
  val contentWidth: Int
    get() = width - (margin * 2)

  val contentHeight: Int
    get() = height - (margin * 2)
}

data class FloatRect(val left: Float, val top: Float, val right: Float, val bottom: Float) {
  val width: Float
    get() = right - left

  val height: Float
    get() = bottom - top
}

object PdfLayout {
  private const val A4_SHORT_EDGE_POINTS = 595
  private const val A4_LONG_EDGE_POINTS = 842

  fun pageGeometry(options: PdfOptions): PageGeometry =
    when (options.orientation) {
      PageOrientation.PORTRAIT ->
        PageGeometry(
          width = A4_SHORT_EDGE_POINTS,
          height = A4_LONG_EDGE_POINTS,
          margin = options.margin.points,
        )
      PageOrientation.LANDSCAPE ->
        PageGeometry(
          width = A4_LONG_EDGE_POINTS,
          height = A4_SHORT_EDGE_POINTS,
          margin = options.margin.points,
        )
    }

  fun fitCenter(sourceWidth: Int, sourceHeight: Int, page: PageGeometry): FloatRect {
    require(sourceWidth > 0 && sourceHeight > 0) { "이미지 크기는 0보다 커야 합니다." }
    require(page.contentWidth > 0 && page.contentHeight > 0) { "PDF 내용 영역이 올바르지 않습니다." }

    val scale =
      min(
        page.contentWidth.toFloat() / sourceWidth.toFloat(),
        page.contentHeight.toFloat() / sourceHeight.toFloat(),
      )
    val renderedWidth = sourceWidth * scale
    val renderedHeight = sourceHeight * scale
    val left = (page.width - renderedWidth) / 2f
    val top = (page.height - renderedHeight) / 2f
    return FloatRect(left, top, left + renderedWidth, top + renderedHeight)
  }

  fun sampledSize(
    sourceWidth: Int,
    sourceHeight: Int,
    maximumWidth: Int,
    maximumHeight: Int,
  ): Pair<Int, Int> {
    require(sourceWidth > 0 && sourceHeight > 0)
    val scale =
      min(
          maximumWidth.toFloat() / sourceWidth.toFloat(),
          maximumHeight.toFloat() / sourceHeight.toFloat(),
        )
        .coerceAtMost(1f)
    return (sourceWidth * scale).toInt().coerceAtLeast(1) to
      (sourceHeight * scale).toInt().coerceAtLeast(1)
  }

  fun bitmapSampleSize(
    sourceWidth: Int,
    sourceHeight: Int,
    requestedWidth: Int,
    requestedHeight: Int,
  ): Int {
    var sampleSize = 1
    if (sourceHeight > requestedHeight || sourceWidth > requestedWidth) {
      val halfHeight = sourceHeight / 2
      val halfWidth = sourceWidth / 2
      while (
        halfHeight / sampleSize >= requestedHeight &&
          halfWidth / sampleSize >= requestedWidth
      ) {
        sampleSize *= 2
      }
    }
    return sampleSize
  }
}
