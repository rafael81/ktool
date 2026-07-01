import type { ToolId } from "@/data/tools";

export type WorkflowPackageId =
  | "photo-scan-submission"
  | "business-document-submission"
  | "freelance-billing";

export type WorkflowProblem = {
  id: string;
  label: string;
  title: string;
  description: string;
  path: string;
  targetToolId: ToolId;
  targetPreset?: string;
};

export type WorkflowStep = {
  label: string;
  title: string;
  description: string;
  toolId: ToolId;
  path: string;
};

export type WorkflowPackage = {
  id: WorkflowPackageId;
  title: string;
  shortTitle: string;
  path: string;
  eyebrow: string;
  description: string;
  primaryQuery: string;
  secondaryQueries: string[];
  trustNote: string;
  problems: WorkflowProblem[];
  steps: WorkflowStep[];
  toolIds: ToolId[];
  faqs: [question: string, answer: string][];
};

export const workflowPackages: WorkflowPackage[] = [
  {
    id: "photo-scan-submission",
    title: "사진·스캔 PDF 제출 패키지",
    shortTitle: "사진 PDF 제출",
    path: "/workflows/photo-scan-submission/",
    eyebrow: "사진 PDF 제출 흐름",
    description:
      "사진 PDF 변환, 스캔본 PDF 만들기, 1MB 사진 용량 줄이기, HEIC JPG 변환, 이미지 리사이즈를 제출 순서로 정리합니다.",
    primaryQuery: "사진 스캔 PDF 제출",
    secondaryQueries: ["사진 PDF 변환", "스캔본 PDF 만들기", "사진 1MB 이하로 줄이기", "HEIC JPG 변환", "이미지 리사이즈"],
    trustNote:
      "이미지 파일은 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    problems: [
      {
        id: "multi-image-pdf",
        label: "사진 PDF",
        title: "사진·스캔본 PDF 만들기",
        description: "여러 장의 JPG, PNG, WebP 이미지를 한 개의 제출용 PDF로 묶습니다.",
        path: "/tools/jpg-to-pdf-converter/",
        targetToolId: "jpg-to-pdf"
      },
      {
        id: "file-too-large",
        label: "1MB 압축",
        title: "사진 1MB 이하로 줄이기",
        description: "업로드 제한이 보이면 1MB 제출 기준으로 먼저 압축합니다.",
        path: "/tools/photo-size-reducer/?preset=1mb",
        targetToolId: "image-compressor",
        targetPreset: "1mb"
      },
      {
        id: "iphone-heic",
        label: "HEIC JPG",
        title: "iPhone HEIC를 JPG로 변환",
        description: "iPhone 사진이 회사, 관공서, 학교 시스템에서 열리지 않을 때 JPG로 바꿉니다.",
        path: "/tools/heic-jpg-converter/?preset=jpg",
        targetToolId: "heic-to-jpg",
        targetPreset: "jpg"
      },
      {
        id: "format-rejected",
        label: "WebP JPG",
        title: "WebP·PNG를 JPG로 변환",
        description: "제출처가 특정 이미지 형식만 받을 때 호환성 높은 JPG로 바꿉니다.",
        path: "/tools/image-converter/?preset=jpg",
        targetToolId: "image-converter",
        targetPreset: "jpg"
      },
      {
        id: "sideways-photo",
        label: "방향 보정",
        title: "스캔 사진 90도 회전",
        description: "스캔본이나 휴대폰 사진이 옆으로 누워 있을 때 방향을 바로잡습니다.",
        path: "/tools/image-rotator/?preset=right",
        targetToolId: "image-rotator",
        targetPreset: "right"
      },
      {
        id: "wide-margin",
        label: "여백 자르기",
        title: "문서 사진 여백 자르기",
        description: "책상, 바닥, 빈 여백이 함께 찍힌 사진에서 제출할 영역만 남깁니다.",
        path: "/tools/image-cropper/?preset=document",
        targetToolId: "image-cropper",
        targetPreset: "document"
      },
      {
        id: "pixel-limit",
        label: "픽셀 제한",
        title: "긴 변 1200px로 리사이즈",
        description: "픽셀 제한이 있거나 사진이 너무 크면 긴 변 기준으로 줄입니다.",
        path: "/tools/image-resizer/?preset=long-1200",
        targetToolId: "image-resizer",
        targetPreset: "long-1200"
      }
    ],
    steps: [
      {
        label: "1",
        title: "형식 오류 해결",
        description: "HEIC, WebP처럼 제출처에서 막히는 형식을 JPG로 바꿉니다.",
        toolId: "heic-to-jpg",
        path: "/tools/heic-jpg-converter/?preset=jpg"
      },
      {
        label: "2",
        title: "방향과 여백 정리",
        description: "사진이 옆으로 눕거나 여백이 많으면 회전과 자르기를 먼저 합니다.",
        toolId: "image-rotator",
        path: "/tools/image-rotator/?preset=right"
      },
      {
        label: "3",
        title: "용량과 크기 맞추기",
        description: "1MB 같은 용량 제한과 긴 변 1200px 같은 픽셀 제한에 맞춥니다.",
        toolId: "image-compressor",
        path: "/tools/photo-size-reducer/?preset=1mb"
      },
      {
        label: "4",
        title: "제출용 PDF 만들기",
        description: "여러 장이면 JPG PDF 변환으로 한 개의 제출용 PDF를 만듭니다.",
        toolId: "jpg-to-pdf",
        path: "/tools/jpg-to-pdf-converter/"
      }
    ],
    toolIds: [
      "heic-to-jpg",
      "image-converter",
      "image-compressor",
      "image-resizer",
      "image-cropper",
      "image-rotator",
      "jpg-to-pdf"
    ],
    faqs: [
      ["사진 여러 장을 한 PDF로 만들 수 있나요?", "JPG PDF 변환에서 JPG, PNG, WebP 이미지를 한 개의 제출용 PDF로 묶을 수 있습니다."],
      ["iPhone HEIC 사진도 제출용으로 바꿀 수 있나요?", "HEIC JPG 변환에서 JPG 출력으로 바로 시작할 수 있습니다."],
      ["이미지 파일이 서버로 업로드되나요?", "아니요. 이미지 도구는 브라우저에서 처리하며 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다."],
      ["용량 제한이 500KB나 3MB일 때도 가능한가요?", "사진 용량 줄이기에서 500KB, 1MB, 3MB 제출 기준을 선택할 수 있습니다."],
      ["사진 방향이나 여백도 정리할 수 있나요?", "이미지 회전과 이미지 자르기로 방향과 문서 영역을 먼저 정리할 수 있습니다."]
    ]
  },
  {
    id: "business-document-submission",
    title: "사업자 명판·거래문서 PDF 패키지",
    shortTitle: "사업자 문서 PDF",
    path: "/workflows/business-document-submission/",
    eyebrow: "사업자 문서 흐름",
    description:
      "사업자 명판, 도장 이미지, 거래명세서 PDF, 견적서 PDF, 청구서 PDF, 영수증 PDF, 한글 금액 표기를 한 흐름으로 정리합니다.",
    primaryQuery: "사업자 명판 거래문서 PDF",
    secondaryQueries: ["사업자 명판 만들기", "거래명세서 PDF 저장", "견적서 PDF 저장", "청구서 PDF 저장", "도장 배경 제거"],
    trustNote:
      "문서 정보는 브라우저에서 처리하며 서버로 전송되지 않습니다. 세금계산서 발행, 인감 증명, 전자서명 인증을 대신하지 않습니다.",
    problems: [
      {
        id: "company-nameplate",
        label: "명판 PNG",
        title: "사업자 명판 PNG 만들기",
        description: "상호, 대표자, 사업자등록번호, 주소를 문서에 넣을 명판 이미지로 만듭니다.",
        path: "/tools/business-nameplate-maker/",
        targetToolId: "business-nameplate"
      },
      {
        id: "stamp-background",
        label: "도장 PNG",
        title: "도장 배경 제거",
        description: "스캔하거나 촬영한 도장 이미지를 투명 PNG로 정리합니다.",
        path: "/tools/stamp-background-remover/",
        targetToolId: "stamp-background"
      },
      {
        id: "transaction-document",
        label: "거래명세서 PDF",
        title: "거래명세서 PDF 작성",
        description: "공급자, 거래처, 품목, 금액을 입력해 거래명세서를 PDF로 저장합니다.",
        path: "/tools/transaction-statement-generator/",
        targetToolId: "transaction-statement"
      },
      {
        id: "estimate-document",
        label: "견적서 PDF",
        title: "견적서 PDF 작성",
        description: "고객명, 품목, 수량, 단가를 입력해 견적서를 PDF로 저장합니다.",
        path: "/tools/estimate-generator/",
        targetToolId: "estimate"
      },
      {
        id: "invoice-document",
        label: "청구서 PDF",
        title: "청구서 PDF 작성",
        description: "청구 품목, 입금기한, 금액을 정리해 청구서를 PDF로 저장합니다.",
        path: "/tools/invoice-generator/",
        targetToolId: "invoice"
      },
      {
        id: "receipt-document",
        label: "영수증 PDF",
        title: "영수증 PDF 저장",
        description: "거래일, 공급자, 구매자, 품목, 금액을 입력해 영수증을 PDF로 저장합니다.",
        path: "/tools/receipt-generator/",
        targetToolId: "receipt"
      },
      {
        id: "korean-amount",
        label: "한글 금액",
        title: "한글 금액 표기 복사",
        description: "계약서, 청구서, 견적서에 넣기 좋은 한글 금액 표기로 바꿉니다.",
        path: "/tools/amount-korean-converter/",
        targetToolId: "amount-korean"
      }
    ],
    steps: [
      {
        label: "1",
        title: "사업자 명판 PNG 준비",
        description: "사업자 명판과 도장 이미지를 문서 삽입용으로 정리합니다.",
        toolId: "business-nameplate",
        path: "/tools/business-nameplate-maker/"
      },
      {
        label: "2",
        title: "거래문서 PDF 작성",
        description: "거래명세서, 견적서, 청구서, 영수증 중 필요한 문서를 작성해 PDF로 저장합니다.",
        toolId: "transaction-statement",
        path: "/tools/transaction-statement-generator/"
      },
      {
        label: "3",
        title: "부가세와 한글 금액 확인",
        description: "부가세와 한글 금액 표기를 확인해 문서에 넣습니다.",
        toolId: "vat-calculator",
        path: "/tools/vat-calculator/"
      },
      {
        label: "4",
        title: "PDF 저장",
        description: "브라우저 인쇄에서 PDF 저장을 선택해 제출용 파일로 보관합니다.",
        toolId: "jpg-to-pdf",
        path: "/tools/jpg-to-pdf-converter/"
      }
    ],
    toolIds: [
      "business-nameplate",
      "stamp-background",
      "transaction-statement",
      "estimate",
      "invoice",
      "receipt",
      "vat-calculator",
      "amount-korean",
      "jpg-to-pdf"
    ],
    faqs: [
      ["사업자 명판 이미지는 법적 효력이 있나요?", "아니요. 문서 삽입용 이미지를 만드는 도구이며 인감 증명이나 전자서명 인증을 대신하지 않습니다."],
      ["거래명세서와 세금계산서는 다른가요?", "거래명세서는 거래 내역 정리용 문서이고 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."],
      ["입력한 거래처 정보가 저장되나요?", "문서 정보는 브라우저에서 처리하며 서버로 전송되지 않습니다."],
      ["PDF로 저장할 수 있나요?", "거래명세서, 견적서, 청구서, 영수증 작성 후 브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      ["도장 이미지를 같이 준비할 수 있나요?", "도장 배경 제거 도구로 흰 배경을 투명 PNG로 정리할 수 있습니다."]
    ]
  },
  {
    id: "freelance-billing",
    title: "프리랜서 3.3% 정산·청구 패키지",
    shortTitle: "3.3% 정산",
    path: "/workflows/freelance-billing/",
    eyebrow: "프리랜서 정산 흐름",
    description:
      "프리랜서 용역비를 청구하기 전 3.3% 원천징수 실수령액, 부가세, 청구서 PDF, 영수증 PDF, 한글 금액 표기를 한 흐름으로 정리합니다.",
    primaryQuery: "프리랜서 3.3% 정산 청구서",
    secondaryQueries: ["프리랜서 3.3% 계산", "프리랜서 실수령액 계산", "프리랜서 청구서 PDF", "프리랜서 영수증 PDF", "부가세 계산기"],
    trustNote:
      "3.3% 계산과 문서 작성은 브라우저에서 처리하며, 세무 신고나 소득 구분 판단을 대신하지 않습니다.",
    problems: [
      {
        id: "withholding",
        label: "3.3% 실수령액",
        title: "프리랜서 3.3% 실수령액 계산",
        description: "총 지급액 또는 실수령액 기준으로 원천징수액과 입금액을 먼저 맞춥니다.",
        path: "/tools/freelance-withholding-calculator/",
        targetToolId: "withholding-tax"
      },
      {
        id: "invoice",
        label: "청구서 PDF",
        title: "프리랜서 청구서 PDF 작성",
        description: "작업 완료 후 고객에게 보낼 청구 금액, 입금기한, 비고를 정리합니다.",
        path: "/tools/invoice-generator/",
        targetToolId: "invoice"
      },
      {
        id: "receipt",
        label: "영수증 PDF",
        title: "프리랜서 영수증 PDF 저장",
        description: "입금 또는 결제 후 거래일, 구매자, 품목, 금액을 영수증으로 남깁니다.",
        path: "/tools/receipt-generator/",
        targetToolId: "receipt"
      },
      {
        id: "estimate",
        label: "견적서 PDF",
        title: "작업 전 견적서 PDF 준비",
        description: "거래 전 예상 금액, 조건, 유효기간을 고객에게 전달합니다.",
        path: "/tools/estimate-generator/",
        targetToolId: "estimate"
      },
      {
        id: "vat",
        label: "부가세 10%",
        title: "부가세 10% 금액 확인",
        description: "공급가액, 부가세, 합계금액을 10% 기준으로 확인합니다.",
        path: "/tools/vat-calculator/",
        targetToolId: "vat-calculator"
      },
      {
        id: "korean-amount",
        label: "금액 표기",
        title: "한글 금액 표기 복사",
        description: "청구서나 견적서에 넣기 좋은 한글 금액 표기로 바꿉니다.",
        path: "/tools/amount-korean-converter/",
        targetToolId: "amount-korean"
      }
    ],
    steps: [
      {
        label: "1",
        title: "3.3% 실수령액 확인",
        description: "원천징수 3.3% 기준으로 지급액, 세액, 실수령액을 먼저 맞춥니다.",
        toolId: "withholding-tax",
        path: "/tools/freelance-withholding-calculator/"
      },
      {
        label: "2",
        title: "청구서 PDF 작성",
        description: "청구서나 견적서로 고객에게 보낼 금액과 조건을 정리합니다.",
        toolId: "invoice",
        path: "/tools/invoice-generator/"
      },
      {
        label: "3",
        title: "영수증 PDF 저장",
        description: "입금 또는 결제 후 영수증으로 거래 내역을 남깁니다.",
        toolId: "receipt",
        path: "/tools/receipt-generator/"
      },
      {
        label: "4",
        title: "한글 금액 복사",
        description: "문서에 넣을 숫자 금액과 한글 금액을 함께 확인합니다.",
        toolId: "amount-korean",
        path: "/tools/amount-korean-converter/"
      }
    ],
    toolIds: ["withholding-tax", "invoice", "receipt", "estimate", "vat-calculator", "amount-korean"],
    faqs: [
      ["3.3% 계산기는 어떤 기준인가요?", "인적용역 사업소득 3.3% 기준의 간편 계산기이며 신고, 환급, 소득 구분 판단을 대신하지 않습니다."],
      ["프리랜서 청구서와 영수증을 같이 만들 수 있나요?", "청구 전에는 청구서, 결제 후에는 영수증 도구를 이어서 사용하고 PDF로 저장할 수 있습니다."],
      ["부가세 계산도 필요한가요?", "거래 방식에 따라 부가세 계산이 필요할 수 있습니다. 일반과세 10% 기준 확인용으로 사용할 수 있습니다."],
      ["PDF로 저장할 수 있나요?", "문서 작성 후 브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      ["입력한 고객 정보가 저장되나요?", "문서 정보는 브라우저에서 처리하며 서버로 보내지 않습니다."]
    ]
  }
];

export function getWorkflowPackage(id: WorkflowPackageId) {
  return workflowPackages.find((workflowPackage) => workflowPackage.id === id);
}
