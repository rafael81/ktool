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
    title: "사진·스캔 제출 패키지",
    shortTitle: "사진·스캔",
    path: "/workflows/photo-scan-submission/",
    eyebrow: "사진 제출 흐름",
    description:
      "iPhone 사진, 스캔본, 증빙 이미지를 제출처 조건에 맞게 형식, 용량, 크기, 방향, PDF 묶기 순서로 정리합니다.",
    primaryQuery: "사진 스캔본 제출 준비",
    secondaryQueries: ["사진 용량 줄이기", "HEIC JPG 변환", "JPG PDF 변환", "이미지 리사이즈"],
    trustNote:
      "이미지 파일은 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    problems: [
      {
        id: "iphone-heic",
        label: "iPhone HEIC",
        title: "HEIC 사진이 안 열림",
        description: "iPhone 사진이 회사, 관공서, 학교 시스템에서 열리지 않을 때 JPG로 바꿉니다.",
        path: "/tools/heic-jpg-converter/?preset=jpg",
        targetToolId: "heic-to-jpg",
        targetPreset: "jpg"
      },
      {
        id: "format-rejected",
        label: "형식 오류",
        title: "WebP·PNG가 막힘",
        description: "제출처가 특정 이미지 형식만 받을 때 호환성 높은 JPG로 바꿉니다.",
        path: "/tools/image-converter/?preset=jpg",
        targetToolId: "image-converter",
        targetPreset: "jpg"
      },
      {
        id: "file-too-large",
        label: "용량 초과",
        title: "1MB 이하로 줄이기",
        description: "업로드 제한이 보이면 1MB 제출 기준으로 먼저 압축합니다.",
        path: "/tools/photo-size-reducer/?preset=1mb",
        targetToolId: "image-compressor",
        targetPreset: "1mb"
      },
      {
        id: "sideways-photo",
        label: "방향 오류",
        title: "오른쪽 90도 회전",
        description: "스캔본이나 휴대폰 사진이 옆으로 누워 있을 때 방향을 바로잡습니다.",
        path: "/tools/image-rotator/?preset=right",
        targetToolId: "image-rotator",
        targetPreset: "right"
      },
      {
        id: "wide-margin",
        label: "여백 많음",
        title: "문서 영역만 자르기",
        description: "책상, 바닥, 빈 여백이 함께 찍힌 사진에서 제출할 영역만 남깁니다.",
        path: "/tools/image-cropper/?preset=document",
        targetToolId: "image-cropper",
        targetPreset: "document"
      },
      {
        id: "pixel-limit",
        label: "크기 제한",
        title: "긴 변 1200px",
        description: "픽셀 제한이 있거나 사진이 너무 크면 긴 변 기준으로 줄입니다.",
        path: "/tools/image-resizer/?preset=long-1200",
        targetToolId: "image-resizer",
        targetPreset: "long-1200"
      },
      {
        id: "multi-image-pdf",
        label: "여러 장 PDF",
        title: "이미지를 PDF로 묶기",
        description: "정리한 증빙 사진이나 스캔 이미지를 한 개의 제출용 PDF로 저장합니다.",
        path: "/tools/jpg-to-pdf-converter/",
        targetToolId: "jpg-to-pdf"
      }
    ],
    steps: [
      {
        label: "1",
        title: "형식 맞추기",
        description: "HEIC, WebP처럼 막히는 형식을 JPG로 바꿉니다.",
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
        title: "크기와 용량 줄이기",
        description: "픽셀 제한과 용량 제한에 맞춘 뒤 제출용 PDF로 묶습니다.",
        toolId: "image-compressor",
        path: "/tools/photo-size-reducer/?preset=1mb"
      },
      {
        label: "4",
        title: "PDF로 저장",
        description: "여러 장이면 JPG PDF 변환으로 한 파일을 만듭니다.",
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
      ["사진 여러 장을 한 PDF로 만들 수 있나요?", "JPG PDF 변환에서 JPG, PNG, WebP 이미지를 한 개의 PDF로 묶을 수 있습니다."],
      ["iPhone HEIC 사진도 제출용으로 바꿀 수 있나요?", "HEIC JPG 변환에서 JPG 출력 preset으로 바로 시작할 수 있습니다."],
      ["이미지 파일이 서버로 업로드되나요?", "아니요. 이미지 도구는 브라우저에서 처리하고 원본 파일명도 분석 이벤트로 보내지 않습니다."],
      ["용량 제한이 500KB나 3MB일 때도 가능한가요?", "사진 용량 줄이기에서 500KB, 1MB, 3MB 제출 preset을 선택할 수 있습니다."],
      ["사진 방향이나 여백도 정리할 수 있나요?", "이미지 회전과 이미지 자르기로 방향과 문서 영역을 먼저 정리할 수 있습니다."]
    ]
  },
  {
    id: "business-document-submission",
    title: "사업자 서류 제출 패키지",
    shortTitle: "사업자 서류",
    path: "/workflows/business-document-submission/",
    eyebrow: "업무 문서 흐름",
    description:
      "회사 정보, 명판, 도장, 거래 문서, 금액 표기를 브라우저에서 정리해 거래처나 기관 제출용 문서로 준비합니다.",
    primaryQuery: "사업자 서류 제출 준비",
    secondaryQueries: ["사업자 명판 만들기", "거래명세서 자동작성", "견적서 자동작성", "도장 배경 제거"],
    trustNote:
      "문서 작성과 이미지 정리를 돕는 도구이며, 세금계산서 발행이나 인감 증명, 전자서명 인증을 대신하지 않습니다.",
    problems: [
      {
        id: "company-nameplate",
        label: "회사 정보",
        title: "사업자 명판 만들기",
        description: "상호, 대표자, 사업자등록번호, 주소를 문서 삽입용 이미지로 만듭니다.",
        path: "/tools/business-nameplate-maker/",
        targetToolId: "business-nameplate"
      },
      {
        id: "stamp-background",
        label: "도장 이미지",
        title: "도장 배경 제거",
        description: "스캔하거나 촬영한 도장 이미지를 투명 PNG로 정리합니다.",
        path: "/tools/stamp-background-remover/",
        targetToolId: "stamp-background"
      },
      {
        id: "transaction-document",
        label: "거래 내역",
        title: "거래명세서 작성",
        description: "공급자, 거래처, 품목, 금액을 입력해 거래명세서를 만듭니다.",
        path: "/tools/transaction-statement-generator/",
        targetToolId: "transaction-statement"
      },
      {
        id: "estimate-document",
        label: "견적 전달",
        title: "견적서 작성",
        description: "고객명, 품목, 수량, 단가를 입력해 견적서를 만듭니다.",
        path: "/tools/estimate-generator/",
        targetToolId: "estimate"
      },
      {
        id: "invoice-document",
        label: "입금 요청",
        title: "청구서 작성",
        description: "청구 품목, 입금기한, 금액을 정리해 청구서를 만듭니다.",
        path: "/tools/invoice-generator/",
        targetToolId: "invoice"
      },
      {
        id: "receipt-document",
        label: "영수 확인",
        title: "영수증 작성",
        description: "거래일, 공급자, 구매자, 품목, 금액을 입력해 영수증을 만듭니다.",
        path: "/tools/receipt-generator/",
        targetToolId: "receipt"
      },
      {
        id: "korean-amount",
        label: "금액 표기",
        title: "금액 한글 변환",
        description: "계약서, 청구서, 견적서에 넣기 좋은 한글 금액 표기로 바꿉니다.",
        path: "/tools/amount-korean-converter/",
        targetToolId: "amount-korean"
      }
    ],
    steps: [
      {
        label: "1",
        title: "회사 정보 준비",
        description: "사업자 명판과 도장 이미지를 문서 삽입용으로 정리합니다.",
        toolId: "business-nameplate",
        path: "/tools/business-nameplate-maker/"
      },
      {
        label: "2",
        title: "문서 작성",
        description: "거래명세서, 견적서, 청구서, 영수증 중 필요한 문서를 작성합니다.",
        toolId: "transaction-statement",
        path: "/tools/transaction-statement-generator/"
      },
      {
        label: "3",
        title: "금액 확인",
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
      ["입력한 거래처 정보가 저장되나요?", "문서 도구는 브라우저에서 처리하며 입력한 문서 내용을 서버로 보내지 않습니다."],
      ["PDF로 저장할 수 있나요?", "문서 작성 후 브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      ["도장 이미지를 같이 준비할 수 있나요?", "도장 배경 제거 도구로 흰 배경을 투명 PNG로 정리할 수 있습니다."]
    ]
  },
  {
    id: "freelance-billing",
    title: "프리랜서 정산·청구 패키지",
    shortTitle: "프리랜서 정산",
    path: "/workflows/freelance-billing/",
    eyebrow: "정산 문서 흐름",
    description:
      "프리랜서 작업 후 3.3% 원천징수, 부가세, 청구서, 영수증, 금액 한글 표기를 빠르게 정리합니다.",
    primaryQuery: "프리랜서 정산 청구서",
    secondaryQueries: ["3.3% 계산기", "청구서 자동작성", "영수증 자동작성", "부가세 계산기"],
    trustNote:
      "간편 계산과 문서 작성을 돕는 도구이며, 세무 신고나 소득 구분 판단을 대신하지 않습니다.",
    problems: [
      {
        id: "withholding",
        label: "3.3%",
        title: "원천징수 계산",
        description: "사업소득 3.3% 원천징수액과 실수령액을 빠르게 확인합니다.",
        path: "/tools/freelance-withholding-calculator/",
        targetToolId: "withholding-tax"
      },
      {
        id: "invoice",
        label: "청구",
        title: "청구서 작성",
        description: "작업 완료 후 고객에게 보낼 청구 금액과 입금기한을 정리합니다.",
        path: "/tools/invoice-generator/",
        targetToolId: "invoice"
      },
      {
        id: "receipt",
        label: "영수",
        title: "영수증 작성",
        description: "거래일, 구매자, 품목, 금액을 입력해 영수증을 만듭니다.",
        path: "/tools/receipt-generator/",
        targetToolId: "receipt"
      },
      {
        id: "estimate",
        label: "견적",
        title: "견적서 작성",
        description: "거래 전 예상 금액과 조건을 고객에게 전달합니다.",
        path: "/tools/estimate-generator/",
        targetToolId: "estimate"
      },
      {
        id: "vat",
        label: "부가세",
        title: "부가세 계산",
        description: "공급가액, 부가세, 합계금액을 10% 기준으로 확인합니다.",
        path: "/tools/vat-calculator/",
        targetToolId: "vat-calculator"
      },
      {
        id: "korean-amount",
        label: "금액 표기",
        title: "금액 한글 변환",
        description: "청구서나 견적서에 넣기 좋은 한글 금액 표기로 바꿉니다.",
        path: "/tools/amount-korean-converter/",
        targetToolId: "amount-korean"
      }
    ],
    steps: [
      {
        label: "1",
        title: "세금 방식 확인",
        description: "3.3% 원천징수 또는 부가세 포함 여부를 먼저 확인합니다.",
        toolId: "withholding-tax",
        path: "/tools/freelance-withholding-calculator/"
      },
      {
        label: "2",
        title: "청구 문서 작성",
        description: "청구서나 견적서로 고객에게 보낼 금액과 조건을 정리합니다.",
        toolId: "invoice",
        path: "/tools/invoice-generator/"
      },
      {
        label: "3",
        title: "영수 확인",
        description: "입금 또는 결제 후 영수증으로 거래 내역을 남깁니다.",
        toolId: "receipt",
        path: "/tools/receipt-generator/"
      },
      {
        label: "4",
        title: "금액 표기 정리",
        description: "문서에 넣을 숫자 금액과 한글 금액을 함께 확인합니다.",
        toolId: "amount-korean",
        path: "/tools/amount-korean-converter/"
      }
    ],
    toolIds: ["withholding-tax", "invoice", "receipt", "estimate", "vat-calculator", "amount-korean"],
    faqs: [
      ["3.3% 계산기는 어떤 기준인가요?", "인적용역 사업소득 3.3% 기준의 간편 계산기이며 신고, 환급, 소득 구분 판단을 대신하지 않습니다."],
      ["청구서와 영수증을 같이 만들 수 있나요?", "청구 전에는 청구서, 결제 후에는 영수증 도구를 이어서 사용할 수 있습니다."],
      ["부가세 계산도 필요한가요?", "거래 방식에 따라 부가세 계산이 필요할 수 있습니다. 일반과세 10% 기준 확인용으로 사용할 수 있습니다."],
      ["PDF로 저장할 수 있나요?", "문서 작성 후 브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      ["입력한 고객 정보가 저장되나요?", "문서 정보는 브라우저에서 처리하며 서버로 보내지 않습니다."]
    ]
  }
];

export function getWorkflowPackage(id: WorkflowPackageId) {
  return workflowPackages.find((workflowPackage) => workflowPackage.id === id);
}
