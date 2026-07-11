package com.kdocumenttool.pdf

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollToNode
import com.kdocumenttool.pdf.theme.KDocumentPdfTheme
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class PdfEditorContentTest {
  @get:Rule val composeRule = createAndroidComposeRule<ComponentActivity>()

  @Test
  fun emptyEditor_explainsHowToStartAndDisablesSave() {
    setEditorContent(state = PdfUiState())

    composeRule.onNodeWithText("K문서 PDF").assertExists()
    composeRule.onNodeWithText("아직 선택한 이미지가 없습니다.").assertExists()
    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("PDF로 저장"))
    composeRule.onNodeWithText("PDF로 저장").assertIsNotEnabled()
  }

  @Test
  fun imageControlsAndOptions_sendTheRequestedActions() {
    var move: Pair<Int, Int>? = null
    var removed: Int? = null
    var orientation: PageOrientation? = null
    var margin: MarginPreset? = null
    val state =
      PdfUiState(
        images =
          listOf(
            SelectedImage("content://test/one"),
            SelectedImage("content://test/two"),
          )
      )
    setEditorContent(
      state = state,
      onMoveImage = { from, to -> move = from to to },
      onRemoveImage = { removed = it },
      onOrientationChange = { orientation = it },
      onMarginChange = { margin = it },
    )

    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasContentDescription("1번째 이미지를 아래로 이동"))
    composeRule
      .onNodeWithContentDescription("1번째 이미지를 아래로 이동")
      .assertIsEnabled()
      .performClick()
    assertEquals(0 to 1, move)

    composeRule
      .onNodeWithContentDescription("1번째 이미지 삭제")
      .assertIsEnabled()
      .performClick()
    assertEquals(0, removed)

    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("가로"))
    composeRule.onNodeWithText("가로").performClick()
    assertEquals(PageOrientation.LANDSCAPE, orientation)

    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("좁게"))
    composeRule.onNodeWithText("좁게").performClick()
    assertEquals(MarginPreset.NARROW, margin)
  }

  @Test
  fun generatingEditor_showsProgressAndDisablesEveryMutatingControl() {
    val state =
      PdfUiState(
        images = listOf(SelectedImage("content://test/one")),
        status = CreationStatus.Generating(completed = 1, total = 2),
      )
    setEditorContent(state)

    composeRule.onNodeWithText("PDF 만드는 중 · 1 / 2").assertExists()
    composeRule.onNodeWithText("이미지 선택").assertIsNotEnabled()
    composeRule
      .onNodeWithContentDescription("1번째 이미지 삭제")
      .assertIsNotEnabled()
    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("PDF 만드는 중…"))
    composeRule.onNodeWithText("PDF 만드는 중…").assertIsNotEnabled()
    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("가로"))
    composeRule.onNodeWithText("가로").assertIsNotEnabled()
  }

  @Test
  fun successAndErrorPanels_explainTheOutcomeAndAllowRetryAfterFailure() {
    val errorMessage = "1번째 이미지를 읽을 수 없습니다."
    val state =
      androidx.compose.runtime.mutableStateOf(
        PdfUiState(
          images = listOf(SelectedImage("content://test/one")),
          status = CreationStatus.Success,
        )
      )
    composeRule.setContent {
      KDocumentPdfTheme(darkTheme = false) {
        PdfEditorContent(
          state = state.value,
          onPickImages = {},
          onMoveImage = { _, _ -> },
          onRemoveImage = {},
          onOrientationChange = {},
          onMarginChange = {},
          onSave = {},
          onPrivacyPolicy = {},
        )
      }
    }

    composeRule.onNodeWithText("PDF 저장 완료").assertExists()
    composeRule.onNodeWithText("선택한 위치에 PDF를 저장했습니다.").assertExists()

    composeRule.runOnIdle {
      state.value = state.value.copy(status = CreationStatus.Error(errorMessage))
    }
    composeRule.onNodeWithText("PDF 저장 실패").assertExists()
    composeRule.onNodeWithText(errorMessage).assertExists()
    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("PDF로 저장"))
    composeRule.onNodeWithText("PDF로 저장").assertIsEnabled()
  }

  @Test
  fun restoredSelectionWithExpiredAccess_disablesSave() {
    setEditorContent(
      PdfUiState(
        images = listOf(SelectedImage("content://test/expired")),
        status = CreationStatus.Info("이미지를 다시 선택해 주세요."),
        requiresReselection = true,
      )
    )

    composeRule.onNodeWithText("이미지를 다시 선택해 주세요.").assertExists()
    composeRule
      .onNodeWithTag("pdf_editor_list")
      .performScrollToNode(hasText("PDF로 저장"))
    composeRule.onNodeWithText("PDF로 저장").assertIsNotEnabled()
  }

  private fun setEditorContent(
    state: PdfUiState,
    onMoveImage: (Int, Int) -> Unit = { _, _ -> },
    onRemoveImage: (Int) -> Unit = {},
    onOrientationChange: (PageOrientation) -> Unit = {},
    onMarginChange: (MarginPreset) -> Unit = {},
  ) {
    composeRule.setContent {
      KDocumentPdfTheme(darkTheme = false) {
        PdfEditorContent(
          state = state,
          onPickImages = {},
          onMoveImage = onMoveImage,
          onRemoveImage = onRemoveImage,
          onOrientationChange = onOrientationChange,
          onMarginChange = onMarginChange,
          onSave = {},
          onPrivacyPolicy = {},
        )
      }
    }
  }
}
