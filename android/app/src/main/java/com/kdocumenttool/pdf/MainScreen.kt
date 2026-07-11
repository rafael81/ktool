package com.kdocumenttool.pdf

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.kdocumenttool.pdf.theme.KDocumentPdfTheme
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext

private const val PRIVACY_POLICY_URL = "https://k-document-tool.pages.dev/privacy/"

@Composable
fun MainScreen(modifier: Modifier = Modifier) {
  val context = LocalContext.current
  val applicationContext = context.applicationContext
  val screenViewModel =
    viewModel<MainScreenViewModel> {
      MainScreenViewModel(
        pdfCreator = AndroidPdfCreator(applicationContext),
        savedStateHandle = createSavedStateHandle(),
        uriGrantManager = AndroidUriGrantManager(applicationContext.contentResolver),
      )
    }
  val state by screenViewModel.uiState.collectAsStateWithLifecycle()
  var showPrivacyPolicy by rememberSaveable { mutableStateOf(false) }

  val photoPicker =
    rememberLauncherForActivityResult(
      contract = ActivityResultContracts.PickMultipleVisualMedia(MAX_IMAGE_COUNT),
      onResult = { uris -> if (uris.isNotEmpty()) screenViewModel.addImages(uris) },
    )
  val createDocument =
    rememberLauncherForActivityResult(
      contract = ActivityResultContracts.CreateDocument("application/pdf"),
      onResult = { destination ->
        if (destination == null) screenViewModel.onSaveCancelled()
        else screenViewModel.createPdf(destination)
      },
    )

  PdfEditorContent(
    state = state,
    onPickImages = {
      photoPicker.launch(
        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
      )
    },
    onMoveImage = screenViewModel::moveImage,
    onRemoveImage = screenViewModel::removeImage,
    onOrientationChange = screenViewModel::setOrientation,
    onMarginChange = screenViewModel::setMargin,
    onSave = { createDocument.launch(suggestedPdfFileName()) },
    onPrivacyPolicy = {
      try {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(PRIVACY_POLICY_URL)))
      } catch (_: ActivityNotFoundException) {
        showPrivacyPolicy = true
      }
    },
    modifier = modifier,
  )

  if (showPrivacyPolicy) {
    PrivacyPolicyDialog(onDismiss = { showPrivacyPolicy = false })
  }
}

@Composable
fun PdfEditorContent(
  state: PdfUiState,
  onPickImages: () -> Unit,
  onMoveImage: (fromIndex: Int, toIndex: Int) -> Unit,
  onRemoveImage: (index: Int) -> Unit,
  onOrientationChange: (PageOrientation) -> Unit,
  onMarginChange: (MarginPreset) -> Unit,
  onSave: () -> Unit,
  onPrivacyPolicy: () -> Unit,
  modifier: Modifier = Modifier,
) {
  Surface(modifier = modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
    LazyColumn(
      modifier = Modifier.fillMaxSize().safeDrawingPadding().testTag("pdf_editor_list"),
      contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp),
      verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
      item(key = "header") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text(
            text = "K문서 PDF",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.semantics { heading() },
          )
          Text(
            text = "사진을 원하는 순서로 정리해 A4 PDF로 저장하세요.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
          )
          Surface(
            color = MaterialTheme.colorScheme.primaryContainer,
            shape = RoundedCornerShape(999.dp),
          ) {
            Text(
              text = "오프라인 변환 · 사진 및 인터넷 권한 없음",
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
              style = MaterialTheme.typography.labelLarge,
              color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
          }
        }
      }

      item(key = "status") { CreationStatusPanel(state.status) }

      item(key = "picker") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Button(
            onClick = onPickImages,
            enabled = !state.isGenerating && state.images.size < MAX_IMAGE_COUNT,
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp),
          ) {
            Text("이미지 선택")
          }
          Text(
            text = "${state.images.size} / $MAX_IMAGE_COUNT 장 선택됨",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.semantics {
              stateDescription = "최대 ${MAX_IMAGE_COUNT}장 중 ${state.images.size}장 선택됨"
            },
          )
        }
      }

      item(key = "images-heading") {
        SectionHeading("이미지 순서", "위·아래 버튼으로 PDF 페이지 순서를 바꿀 수 있습니다.")
      }

      if (state.images.isEmpty()) {
        item(key = "empty") { EmptyImageList() }
      } else {
        itemsIndexed(
          items = state.images,
          key = { _, image -> image.uri },
        ) { index, image ->
          SelectedImageCard(
            image = image,
            position = index + 1,
            canMoveUp = index > 0,
            canMoveDown = index < state.images.lastIndex,
            enabled = !state.isGenerating,
            onMoveUp = { onMoveImage(index, index - 1) },
            onMoveDown = { onMoveImage(index, index + 1) },
            onRemove = { onRemoveImage(index) },
          )
        }
      }

      item(key = "options-divider") { HorizontalDivider() }

      item(key = "orientation") {
        ChoiceSection(
          title = "A4 방향",
          values = PageOrientation.entries,
          selected = state.options.orientation,
          label = PageOrientation::label,
          description = {
            if (it == PageOrientation.PORTRAIT) "세로 문서" else "가로 문서"
          },
          enabled = !state.isGenerating,
          onSelected = onOrientationChange,
        )
      }

      item(key = "margin") {
        ChoiceSection(
          title = "페이지 여백",
          values = MarginPreset.entries,
          selected = state.options.margin,
          label = MarginPreset::label,
          description = MarginPreset::description,
          enabled = !state.isGenerating,
          onSelected = onMarginChange,
        )
      }

      item(key = "save") {
        Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
          Button(
            onClick = onSave,
            enabled = state.canSave,
            modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp),
          ) {
            Text(if (state.isGenerating) "PDF 만드는 중…" else "PDF로 저장")
          }
          Text(
            text = "저장 위치와 파일 이름은 다음 화면에서 선택합니다.",
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
          )
        }
      }

      item(key = "privacy") {
        TextButton(
          onClick = onPrivacyPolicy,
          modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
        ) {
          Text("개인정보처리방침")
        }
      }
    }
  }
}

@Composable
private fun CreationStatusPanel(status: CreationStatus) {
  if (status == CreationStatus.Ready) return

  val containerColor =
    when (status) {
      is CreationStatus.Error -> MaterialTheme.colorScheme.errorContainer
      CreationStatus.Success -> MaterialTheme.colorScheme.primaryContainer
      else -> MaterialTheme.colorScheme.secondaryContainer
    }
  val contentColor =
    when (status) {
      is CreationStatus.Error -> MaterialTheme.colorScheme.onErrorContainer
      CreationStatus.Success -> MaterialTheme.colorScheme.onPrimaryContainer
      else -> MaterialTheme.colorScheme.onSecondaryContainer
    }
  val announcementMode =
    if (status is CreationStatus.Error) LiveRegionMode.Assertive else LiveRegionMode.Polite

  Surface(
    modifier = Modifier.fillMaxWidth().semantics { liveRegion = announcementMode },
    shape = RoundedCornerShape(14.dp),
    color = containerColor,
    contentColor = contentColor,
  ) {
    Column(
      modifier = Modifier.padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(9.dp),
    ) {
      when (status) {
        is CreationStatus.Info -> Text(status.message)
        is CreationStatus.Generating -> {
          Text(
            "PDF 만드는 중 · ${status.completed} / ${status.total}",
            fontWeight = FontWeight.SemiBold,
          )
          LinearProgressIndicator(
            progress = { status.fraction },
            modifier = Modifier.fillMaxWidth().semantics {
              stateDescription = "${status.total}장 중 ${status.completed}장 처리됨"
            },
          )
        }
        CreationStatus.Success -> {
          Text("PDF 저장 완료", fontWeight = FontWeight.Bold)
          Text("선택한 위치에 PDF를 저장했습니다.")
        }
        is CreationStatus.Error -> {
          Text("PDF 저장 실패", fontWeight = FontWeight.Bold)
          Text(status.message)
        }
        CreationStatus.Ready -> Unit
      }
    }
  }
}

@Composable
private fun SectionHeading(title: String, supportingText: String) {
  Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
    Text(
      text = title,
      style = MaterialTheme.typography.titleLarge,
      modifier = Modifier.semantics { heading() },
    )
    Text(
      text = supportingText,
      style = MaterialTheme.typography.bodyMedium,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
  }
}

@Composable
private fun EmptyImageList() {
  Surface(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(16.dp),
    color = MaterialTheme.colorScheme.surfaceVariant,
  ) {
    Column(
      modifier = Modifier.padding(horizontal = 20.dp, vertical = 24.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
      Text("아직 선택한 이미지가 없습니다.", fontWeight = FontWeight.SemiBold)
      Text(
        "위의 이미지 선택 버튼을 눌러 시작하세요.",
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        textAlign = TextAlign.Center,
      )
    }
  }
}

@Composable
private fun SelectedImageCard(
  image: SelectedImage,
  position: Int,
  canMoveUp: Boolean,
  canMoveDown: Boolean,
  enabled: Boolean,
  onMoveUp: () -> Unit,
  onMoveDown: () -> Unit,
  onRemove: () -> Unit,
) {
  Card(
    modifier = Modifier.fillMaxWidth(),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
  ) {
    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        UriThumbnail(image = image, position = position)
        Spacer(Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
          Text("${position}번째 이미지", fontWeight = FontWeight.Bold)
          Text(
            "PDF $position 페이지",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
          )
        }
        TextButton(
          onClick = onRemove,
          enabled = enabled,
          modifier = Modifier.semantics {
            contentDescription = "${position}번째 이미지 삭제"
          },
        ) {
          Text("삭제")
        }
      }
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.End,
      ) {
        OutlinedButton(
          onClick = onMoveUp,
          enabled = enabled && canMoveUp,
          modifier = Modifier.semantics {
            contentDescription = "${position}번째 이미지를 위로 이동"
          },
        ) {
          Text("위로")
        }
        Spacer(Modifier.width(8.dp))
        OutlinedButton(
          onClick = onMoveDown,
          enabled = enabled && canMoveDown,
          modifier = Modifier.semantics {
            contentDescription = "${position}번째 이미지를 아래로 이동"
          },
        ) {
          Text("아래로")
        }
      }
    }
  }
}

private sealed interface ThumbnailState {
  data object Loading : ThumbnailState

  data class Ready(val bitmap: Bitmap) : ThumbnailState

  data object Failed : ThumbnailState
}

@Composable
private fun UriThumbnail(image: SelectedImage, position: Int) {
  val resolver = LocalContext.current.contentResolver
  val cancellationSignal = remember(image.uri) { android.os.CancellationSignal() }
  DisposableEffect(cancellationSignal) {
    onDispose { cancellationSignal.cancel() }
  }
  val state by
    produceState<ThumbnailState>(ThumbnailState.Loading, image.uri) {
      value =
        withContext(Dispatchers.IO) {
          try {
            val loaded =
              PlatformImageLoader.loadThumbnail(
                resolver,
                Uri.parse(image.uri),
                cancellationSignal,
              )
            try {
              coroutineContext.ensureActive()
              ThumbnailState.Ready(loaded)
            } catch (throwable: Throwable) {
              loaded.recycle()
              throw throwable
            }
          } catch (cancellation: kotlinx.coroutines.CancellationException) {
            throw cancellation
          } catch (_: Throwable) {
            ThumbnailState.Failed
          }
        }
    }
  val bitmap = (state as? ThumbnailState.Ready)?.bitmap
  DisposableEffect(bitmap) { onDispose { bitmap?.recycle() } }

  Box(
    modifier =
      Modifier.size(76.dp)
        .clip(RoundedCornerShape(12.dp))
        .background(MaterialTheme.colorScheme.surfaceVariant),
    contentAlignment = Alignment.Center,
  ) {
    when (val current = state) {
      ThumbnailState.Loading -> Text("불러오는 중", style = MaterialTheme.typography.labelSmall)
      ThumbnailState.Failed ->
        Text(
          "미리보기\n불가",
          style = MaterialTheme.typography.labelSmall,
          textAlign = TextAlign.Center,
        )
      is ThumbnailState.Ready ->
        Image(
          bitmap = remember(current.bitmap) { current.bitmap.asImageBitmap() },
          contentDescription = "${position}번째 이미지 미리보기",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize(),
        )
    }
  }
}

@Composable
private fun <T> ChoiceSection(
  title: String,
  values: List<T>,
  selected: T,
  label: (T) -> String,
  description: (T) -> String,
  enabled: Boolean,
  onSelected: (T) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    Text(
      text = title,
      style = MaterialTheme.typography.titleLarge,
      modifier = Modifier.semantics { heading() },
    )
    Column(modifier = Modifier.selectableGroup()) {
      values.forEach { value ->
        val valueLabel = label(value)
        Row(
          modifier =
            Modifier.fillMaxWidth()
              .heightIn(min = 52.dp)
              .selectable(
                selected = value == selected,
                enabled = enabled,
                role = Role.RadioButton,
                onClick = { onSelected(value) },
              )
              .semantics(mergeDescendants = true) {}
              .padding(horizontal = 4.dp),
          verticalAlignment = Alignment.CenterVertically,
        ) {
          RadioButton(selected = value == selected, onClick = null, enabled = enabled)
          Spacer(Modifier.width(10.dp))
          Column {
            Text(valueLabel, fontWeight = FontWeight.SemiBold)
            Text(
              description(value),
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
          }
        }
      }
    }
  }
}

@Composable
private fun PrivacyPolicyDialog(onDismiss: () -> Unit) {
  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("개인정보처리방침") },
    text = {
      Text(
        "선택한 이미지는 기기 안에서만 PDF로 변환되며 서버로 전송되지 않습니다. " +
          "앱은 사진 전체 접근 권한이나 인터넷 권한을 요청하지 않습니다. " +
          "선택 목록과 읽기 권한은 진행 중인 작업을 복구하는 동안만 유지됩니다. " +
          "완성된 PDF는 사용자가 직접 고른 위치에만 저장됩니다.\n\n" +
          "정책 주소: $PRIVACY_POLICY_URL"
      )
    },
    confirmButton = { TextButton(onClick = onDismiss) { Text("확인") } },
  )
}

private fun suggestedPdfFileName(): String {
  val timestamp = SimpleDateFormat("yyyyMMdd_HHmm", Locale.US).format(Date())
  return "K문서_PDF_$timestamp.pdf"
}

@androidx.compose.ui.tooling.preview.Preview(showBackground = true, widthDp = 390)
@Composable
private fun PdfEditorPreview() {
  KDocumentPdfTheme(darkTheme = false) {
    PdfEditorContent(
      state = PdfUiState(),
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
