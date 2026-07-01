import type { ToolId } from "@/data/tools";

export type PrepShortcut = {
  id: string;
  label: string;
  title: string;
  path: string;
  description: string;
  targetToolId: ToolId;
  targetToolTitle: string;
  targetPreset?: string;
};

export const prepShortcuts: PrepShortcut[] = [
  {
    id: "format-jpg",
    label: "파일 형식 오류",
    title: "JPG로 먼저 변환",
    path: "/tools/image-converter/?preset=jpg&source=prep-shortcut&shortcut_id=format-jpg",
    description: "WebP, PNG, JPG 형식이 제출처에서 막히면 호환성 높은 JPG 설정으로 바로 엽니다.",
    targetToolId: "image-converter",
    targetToolTitle: "WebP JPG 변환",
    targetPreset: "jpg"
  },
  {
    id: "heic-jpg",
    label: "iPhone HEIC",
    title: "HEIC를 JPG로",
    path: "/tools/heic-jpg-converter/?preset=jpg&source=prep-shortcut&shortcut_id=heic-jpg",
    description: "iPhone 사진이 열리지 않을 때 HEIC JPG 변환을 JPG 출력 설정으로 시작합니다.",
    targetToolId: "heic-to-jpg",
    targetToolTitle: "HEIC JPG 변환",
    targetPreset: "jpg"
  },
  {
    id: "compress-1mb",
    label: "용량 초과",
    title: "1MB 기준 압축",
    path: "/tools/photo-size-reducer/?preset=1mb&source=prep-shortcut&shortcut_id=compress-1mb",
    description: "업로드 제한이 보이면 먼저 1MB 이하 제출 기준으로 사진 용량을 줄입니다.",
    targetToolId: "image-compressor",
    targetToolTitle: "사진 용량 줄이기",
    targetPreset: "1mb"
  },
  {
    id: "resize-long-1200",
    label: "크기 제한",
    title: "긴 변 1200px",
    path: "/tools/image-resizer/?preset=long-1200&source=prep-shortcut&shortcut_id=resize-long-1200",
    description: "픽셀 제한이 있거나 사진이 너무 크면 제출용 긴 변 기준으로 줄입니다.",
    targetToolId: "image-resizer",
    targetToolTitle: "이미지 리사이즈",
    targetPreset: "long-1200"
  },
  {
    id: "rotate-right",
    label: "사진이 옆으로",
    title: "오른쪽 90도 회전",
    path: "/tools/image-rotator/?preset=right&source=prep-shortcut&shortcut_id=rotate-right",
    description: "스캔본이나 휴대폰 사진 방향이 틀어졌을 때 가장 흔한 오른쪽 회전으로 엽니다.",
    targetToolId: "image-rotator",
    targetToolTitle: "이미지 회전",
    targetPreset: "right"
  },
  {
    id: "crop-document",
    label: "여백·배경 많음",
    title: "문서 영역 자르기",
    path: "/tools/image-cropper/?preset=document&source=prep-shortcut&shortcut_id=crop-document",
    description: "책상, 바닥, 빈 여백이 함께 찍힌 사진에서 제출할 문서 영역만 남깁니다.",
    targetToolId: "image-cropper",
    targetToolTitle: "이미지 자르기",
    targetPreset: "document"
  },
  {
    id: "bundle-jpg-pdf",
    label: "여러 장 PDF",
    title: "JPG PDF로 묶기",
    path: "/tools/jpg-to-pdf-converter/?from=prep-shortcut&source=prep-shortcut&shortcut_id=bundle-jpg-pdf",
    description: "정리한 증빙 사진이나 스캔 이미지를 한 개의 제출용 PDF로 저장합니다.",
    targetToolId: "jpg-to-pdf",
    targetToolTitle: "JPG PDF 변환"
  }
];
