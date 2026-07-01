import type { ToolId } from "@/data/tools";

export type ProblemPageId =
  | "business-nameplate-stamp"
  | "transaction-statement-pdf"
  | "estimate-pdf"
  | "invoice-pdf"
  | "receipt-pdf"
  | "file-format-error"
  | "heic-jpg-submit"
  | "photo-under-1mb"
  | "image-pixel-limit"
  | "sideways-scan"
  | "document-photo-crop"
  | "images-to-one-pdf";

export type ProblemPage = {
  id: ProblemPageId;
  slug: string;
  path: string;
  title: string;
  shortTitle: string;
  description: string;
  metaDescription: string;
  primaryQuery: string;
  secondaryQueries: string[];
  intentQueries: string[];
  targetToolId: ToolId;
  targetPath: string;
  targetLabel: string;
  targetPreset?: string;
  heroBadges?: string[];
  actionNote: string;
  steps: string[];
  faqs: [question: string, answer: string][];
  relatedProblemIds: ProblemPageId[];
};

export const problemPages: ProblemPage[] = [
  {
    id: "business-nameplate-stamp",
    slug: "business-nameplate-stamp",
    path: "/problems/business-nameplate-stamp/",
    title: "사업자 명판 도장 이미지 만들기",
    shortTitle: "명판 도장",
    description: "견적서, 거래명세서, 계약서에 회사 정보와 도장을 넣어야 할 때 명판 PNG를 만듭니다.",
    metaDescription:
      "사업자명, 대표자, 사업자등록번호, 주소와 도장을 합친 사업자 명판 이미지를 무료로 만드세요. 설치 없이 브라우저에서 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "사업자 명판 도장 이미지",
    secondaryQueries: ["사업자 명판 만들기", "명판 도장 합성", "전자 사업자 명판"],
    intentQueries: [
      "견적서 명판 넣기",
      "거래명세서 도장 합성",
      "사업자등록번호 명판",
      "회사 정보 이미지",
      "문서용 명판 PNG",
      "도장 들어간 명판",
      "명판 이미지 만들기",
      "전자 명판 만들기"
    ],
    targetToolId: "business-nameplate",
    targetPath: "/tools/business-nameplate-maker/",
    targetLabel: "명판 PNG 만들기",
    actionNote: "상호, 대표자, 사업자등록번호, 주소와 도장을 한 장의 PNG로 저장합니다.",
    steps: ["사업자 정보 입력", "도장 이미지 선택", "배경 투명 여부 확인", "PNG 저장"],
    faqs: [
      [
        "사업자 명판 이미지는 어디에 넣나요?",
        "견적서, 거래명세서, 계약서, 발주서처럼 회사 정보와 도장을 반복해서 넣는 문서에 이미지로 삽입할 때 씁니다."
      ],
      [
        "도장까지 한 번에 합성할 수 있나요?",
        "네. 도장 PNG 또는 JPG를 선택하면 명판 미리보기에 함께 배치하고 한 장의 PNG로 저장할 수 있습니다."
      ],
      [
        "투명 배경으로 저장할 수 있나요?",
        "네. 문서 위에 자연스럽게 올릴 수 있도록 투명 배경 PNG 저장을 지원합니다."
      ],
      [
        "입력한 사업자 정보가 저장되나요?",
        "아니요. 사업자명, 대표자명, 사업자등록번호, 주소, 도장 이미지는 브라우저 안에서만 처리하고 서버로 보내지 않습니다."
      ],
      [
        "법적 효력이 있는 전자서명인가요?",
        "아니요. 이 도구는 문서 삽입용 이미지를 만드는 용도이며, 전자서명 인증이나 인감 증명을 대신하지 않습니다."
      ]
    ],
    relatedProblemIds: ["file-format-error", "document-photo-crop", "images-to-one-pdf"]
  },
  {
    id: "transaction-statement-pdf",
    slug: "transaction-statement-pdf",
    path: "/problems/transaction-statement-pdf/",
    title: "거래명세서 양식 PDF 저장하기",
    shortTitle: "거래명세서 PDF",
    description: "공급자, 거래처, 품목을 입력해 거래명세서를 바로 작성하고 PDF로 저장합니다.",
    metaDescription:
      "거래명세서 양식을 무료로 작성하고 PDF로 저장하세요. 공급자, 거래처, 품목, 부가세, 합계 한글 금액을 설치 없이 브라우저에서 처리하고 입력값은 서버로 전송되지 않습니다.",
    primaryQuery: "거래명세서 양식 PDF",
    secondaryQueries: ["거래명세서 양식 무료", "거래명세서 자동작성", "거래명세서 PDF 저장"],
    intentQueries: [
      "거래명세서 바로 작성",
      "거래명세표 양식",
      "거래명세서 무료 양식",
      "거래명세서 인쇄",
      "공급자 거래처 품목 입력",
      "거래명세서 부가세 계산",
      "거래명세서 합계 한글",
      "거래명세서 PDF 만들기"
    ],
    targetToolId: "transaction-statement",
    targetPath: "/tools/transaction-statement-generator/",
    targetLabel: "거래명세서 작성",
    actionNote: "공급자, 거래처, 품목, 수량, 단가를 입력해 인쇄 가능한 거래명세서를 만듭니다.",
    steps: ["공급자와 거래처 입력", "품목·수량·단가 입력", "부가세와 합계 확인", "인쇄 또는 PDF 저장"],
    faqs: [
      [
        "거래명세서 양식을 다운로드해야 하나요?",
        "아니요. 브라우저에서 바로 입력하고 미리보기를 확인한 뒤 인쇄 화면에서 PDF로 저장할 수 있습니다."
      ],
      [
        "부가세 포함 금액도 계산되나요?",
        "네. 부가세 별도, 포함, 없음 중에서 선택해 공급가액, 세액, 합계를 확인할 수 있습니다."
      ],
      [
        "합계 금액을 한글로 표시할 수 있나요?",
        "네. 합계 금액은 문서 하단에 한글 금액으로 함께 표시됩니다."
      ],
      [
        "입력한 거래처 정보가 저장되나요?",
        "아니요. 공급자, 거래처, 품목 정보는 브라우저 안에서 문서 미리보기와 인쇄에만 사용하고 서버로 보내지 않습니다."
      ],
      [
        "세금계산서를 대신할 수 있나요?",
        "아니요. 거래명세서는 거래 내역 정리용 문서이며, 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."
      ]
    ],
    relatedProblemIds: ["business-nameplate-stamp", "images-to-one-pdf", "file-format-error"]
  },
  {
    id: "estimate-pdf",
    slug: "estimate-pdf",
    path: "/problems/estimate-pdf/",
    title: "견적서 양식 PDF 저장하기",
    shortTitle: "견적서 PDF",
    description: "고객명, 품목, 수량, 단가를 입력해 견적서를 바로 작성하고 PDF로 저장합니다. 파일은 서버로 전송되지 않습니다.",
    metaDescription:
      "견적서 양식을 무료로 작성하고 PDF로 저장하세요. 고객명, 품목, 수량, 단가, 부가세, 유효기간을 설치 없이 브라우저에서 처리하고 입력값은 서버로 전송되지 않습니다.",
    primaryQuery: "견적서 양식 PDF",
    secondaryQueries: ["견적서 양식 무료", "견적서 자동작성", "견적서 PDF 저장"],
    intentQueries: [
      "견적서 바로 작성",
      "무료 견적서 양식",
      "견적서 인쇄",
      "견적서 유효기간",
      "견적서 부가세 계산",
      "견적서 합계 한글",
      "견적서 PDF 만들기",
      "견적서 양식 다운로드"
    ],
    targetToolId: "estimate",
    targetPath: "/tools/estimate-generator/",
    targetLabel: "견적서 작성",
    actionNote: "고객명, 품목, 수량, 단가, 유효기간을 입력해 견적서 PDF 만들기를 바로 시작합니다.",
    steps: ["공급자와 고객 입력", "품목·수량·단가 입력", "유효기간과 합계 확인", "인쇄 또는 PDF 저장"],
    faqs: [
      [
        "견적서 양식을 다운로드해야 하나요?",
        "아니요. 브라우저에서 바로 입력하고 미리보기를 확인한 뒤 인쇄 화면에서 PDF로 저장할 수 있습니다."
      ],
      [
        "부가세 포함 견적도 만들 수 있나요?",
        "네. 부가세 별도, 포함, 없음 중에서 선택해 공급가액, 세액, 합계를 확인할 수 있습니다."
      ],
      [
        "견적 유효기간을 넣을 수 있나요?",
        "네. 유효기간 필드를 입력하면 견적서 미리보기에 함께 표시됩니다."
      ],
      [
        "입력한 고객 정보가 저장되나요?",
        "아니요. 공급자, 고객, 품목 정보는 브라우저 안에서 문서 미리보기와 인쇄에만 사용하고 서버로 보내지 않습니다."
      ],
      [
        "견적서가 계약서를 대신하나요?",
        "아니요. 견적서는 금액과 조건을 제안하는 일반 문서이며, 계약 체결이나 세금계산서 발행을 대신하지 않습니다."
      ]
    ],
    relatedProblemIds: ["transaction-statement-pdf", "business-nameplate-stamp", "images-to-one-pdf"]
  },
  {
    id: "invoice-pdf",
    slug: "invoice-pdf",
    path: "/problems/invoice-pdf/",
    title: "청구서 양식 PDF 저장하기",
    shortTitle: "청구서 PDF",
    description: "공급자, 고객, 청구 품목, 입금기한을 입력해 청구서를 바로 작성하고 PDF로 저장합니다. 파일은 서버로 전송되지 않습니다.",
    metaDescription:
      "청구서 양식을 무료로 작성하고 PDF로 저장하세요. 공급자, 고객, 청구 품목, 입금기한, 부가세, 합계 한글 금액을 설치 없이 브라우저에서 처리하고 입력값은 서버로 전송되지 않습니다.",
    primaryQuery: "청구서 양식 PDF",
    secondaryQueries: ["청구서 양식 무료", "무료 청구서 양식", "청구서 PDF 저장"],
    intentQueries: [
      "청구서 바로 작성",
      "무료 청구서 양식",
      "청구서 인쇄",
      "입금기한 표시",
      "청구서 부가세 계산",
      "청구서 합계 한글",
      "청구서 PDF 만들기",
      "입금 요청서 양식"
    ],
    targetToolId: "invoice",
    targetPath: "/tools/invoice-generator/",
    targetLabel: "청구서 작성",
    actionNote: "공급자, 고객, 청구 품목, 입금기한을 입력해 청구서 PDF 만들기를 바로 시작합니다.",
    steps: ["공급자와 고객 입력", "청구 품목·수량·단가 입력", "입금기한과 합계 확인", "인쇄 또는 PDF 저장"],
    faqs: [
      [
        "청구서 양식을 다운로드해야 하나요?",
        "아니요. 브라우저에서 바로 입력하고 미리보기를 확인한 뒤 인쇄 화면에서 PDF로 저장할 수 있습니다."
      ],
      [
        "입금기한을 넣을 수 있나요?",
        "네. 입금기한 필드를 입력하면 청구서 미리보기 상단에 함께 표시됩니다."
      ],
      [
        "계좌번호나 결제 조건을 넣을 수 있나요?",
        "네. 비고에 계좌번호, 결제 조건, 담당자 연락처 같은 안내를 적을 수 있습니다."
      ],
      [
        "입력한 고객 정보가 저장되나요?",
        "아니요. 공급자, 고객, 품목 정보는 브라우저 안에서 문서 미리보기와 인쇄에만 사용하고 서버로 보내지 않습니다."
      ],
      [
        "청구서가 세금계산서를 대신하나요?",
        "아니요. 청구서는 대금 지급을 요청하는 일반 문서이며, 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."
      ]
    ],
    relatedProblemIds: ["transaction-statement-pdf", "estimate-pdf", "business-nameplate-stamp"]
  },
  {
    id: "receipt-pdf",
    slug: "receipt-pdf",
    path: "/problems/receipt-pdf/",
    title: "영수증 양식 PDF 저장하기",
    shortTitle: "영수증 PDF",
    description: "거래일, 공급자, 구매자, 품목, 금액을 입력해 영수증을 바로 작성하고 PDF로 저장합니다. 파일은 서버로 전송되지 않습니다.",
    metaDescription:
      "영수증 양식을 무료로 작성하고 PDF로 저장하세요. 거래일, 공급자, 구매자, 품목, 부가세, 합계 한글 금액을 설치 없이 브라우저에서 처리하고 입력값은 서버로 전송되지 않습니다.",
    primaryQuery: "영수증 양식 PDF",
    secondaryQueries: ["영수증 양식 무료", "간이영수증 양식", "영수증 PDF 저장"],
    intentQueries: [
      "영수증 바로 작성",
      "영수증 무료 양식",
      "간이영수증 무료 양식",
      "영수증 인쇄",
      "영수증 부가세 계산",
      "영수증 합계 한글",
      "영수증 PDF 만들기",
      "거래 내역 영수증"
    ],
    targetToolId: "receipt",
    targetPath: "/tools/receipt-generator/",
    targetLabel: "영수증 작성",
    actionNote: "거래일, 공급자, 구매자, 품목, 금액을 입력해 영수증 PDF 만들기를 바로 시작합니다.",
    steps: ["거래일과 공급자 입력", "구매자와 품목 입력", "부가세와 합계 확인", "인쇄 또는 PDF 저장"],
    faqs: [
      [
        "영수증 양식을 다운로드해야 하나요?",
        "아니요. 브라우저에서 바로 입력하고 미리보기를 확인한 뒤 인쇄 화면에서 PDF로 저장할 수 있습니다."
      ],
      [
        "간이영수증처럼 사용할 수 있나요?",
        "간단한 거래 내역 확인용 양식으로 작성할 수 있습니다. 법적·세무 증빙이 필요한 경우 공식 발행 수단을 확인하세요."
      ],
      [
        "부가세 포함 금액도 계산되나요?",
        "네. 부가세 별도, 포함, 없음 중에서 선택해 공급가액, 세액, 합계를 확인할 수 있습니다."
      ],
      [
        "입력한 구매자 정보가 저장되나요?",
        "아니요. 공급자, 구매자, 품목 정보는 브라우저 안에서 문서 미리보기와 인쇄에만 사용하고 서버로 보내지 않습니다."
      ],
      [
        "세금계산서나 현금영수증을 대신하나요?",
        "아니요. 이 영수증은 거래 내역을 정리하는 일반 양식이며, 세금계산서, 현금영수증, 카드 매출전표 발행을 대신하지 않습니다."
      ]
    ],
    relatedProblemIds: ["invoice-pdf", "transaction-statement-pdf", "business-nameplate-stamp"]
  },
  {
    id: "file-format-error",
    slug: "file-format-error",
    path: "/problems/file-format-error/",
    title: "파일 형식 오류 해결",
    shortTitle: "형식 오류",
    description: "제출처가 JPG만 받거나 WebP, PNG 파일을 거부할 때 바로 JPG로 변환합니다.",
    metaDescription:
      "파일 형식 오류가 뜰 때 WebP, PNG, JPG 이미지를 브라우저에서 JPG로 변환하세요. 설치 없이 무료로 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "파일 형식 오류",
    secondaryQueries: ["이미지 JPG 변환", "PNG JPG 변환", "WebP JPG 변환"],
    intentQueries: [
      "파일 업로드 안됨",
      "지원하지 않는 파일 형식",
      "허용되지 않는 확장자",
      "jpg만 가능",
      "png jpg 바꾸기",
      "webp jpg 바꾸기",
      "파일 확장자 오류",
      "이미지 형식 바꾸기"
    ],
    targetToolId: "image-converter",
    targetPath: "/tools/image-converter/?preset=jpg",
    targetLabel: "JPG 변환 시작",
    targetPreset: "jpg",
    actionNote: "출력 형식을 JPG로 열어 제출 호환성을 먼저 맞춥니다.",
    steps: ["이미지 파일 선택", "출력 형식 JPG 확인", "변환 파일 저장", "필요하면 PDF로 묶기"],
    faqs: [
      ["파일 형식 오류는 왜 뜨나요?", "제출처가 JPG처럼 정해진 이미지 형식만 허용할 때 WebP, PNG, HEIC 파일에서 자주 발생합니다."],
      ["JPG로 바꾸면 대부분 해결되나요?", "사진 제출은 JPG를 받는 곳이 많아 호환성이 좋습니다. 다만 제출처 안내에 PDF나 PNG가 적혀 있으면 그 기준을 따르세요."],
      ["WebP도 JPG로 바꿀 수 있나요?", "네. WebP, PNG, JPG 이미지를 선택해 JPG, PNG, WebP 중 원하는 형식으로 저장할 수 있습니다."],
      ["파일이 서버로 올라가나요?", "아니요. 이미지는 브라우저 안에서 변환하고 원본 파일과 파일명은 서버로 보내지 않습니다."],
      ["여러 장도 한 번에 가능한가요?", "이미지 형식 변환 도구에서 여러 이미지를 한 번에 선택해 변환할 수 있습니다."]
    ],
    relatedProblemIds: ["heic-jpg-submit", "images-to-one-pdf", "photo-under-1mb"]
  },
  {
    id: "heic-jpg-submit",
    slug: "heic-jpg-submit",
    path: "/problems/heic-jpg-submit/",
    title: "HEIC JPG 제출 준비",
    shortTitle: "HEIC JPG",
    description: "iPhone 사진이 HEIC라서 열리지 않거나 업로드가 막힐 때 JPG로 변환합니다.",
    metaDescription:
      "아이폰 HEIC 사진이 제출처에서 열리지 않을 때 브라우저에서 JPG로 변환하세요. 설치 없이 무료로 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "HEIC JPG 변환",
    secondaryQueries: ["아이폰 사진 JPG 변환", "HEIC 제출 오류", "HEIF JPG 변환"],
    intentQueries: [
      "아이폰 사진 안열림",
      "아이폰 사진 업로드 안됨",
      "heic 파일 안열림",
      "heic jpg로",
      "heif jpg로",
      "아이폰 사진 제출",
      "갤러리 사진 jpg",
      "휴대폰 사진 변환"
    ],
    targetToolId: "heic-to-jpg",
    targetPath: "/tools/heic-jpg-converter/?preset=jpg",
    targetLabel: "HEIC JPG 변환",
    targetPreset: "jpg",
    actionNote: "iPhone 사진을 제출 호환성이 높은 JPG로 저장합니다.",
    steps: ["HEIC 파일 선택", "출력 형식 JPG 확인", "변환 파일 저장", "용량이 크면 압축"],
    faqs: [
      ["HEIC는 왜 제출이 안 되나요?", "일부 회사, 학교, 관공서 시스템은 HEIC 미리보기나 업로드를 지원하지 않아 JPG 변환이 필요할 수 있습니다."],
      ["iPhone 사진을 바로 JPG로 만들 수 있나요?", "네. HEIC 또는 HEIF 파일을 선택하면 JPG 또는 PNG로 저장할 수 있습니다."],
      ["변환하면 원본이 바뀌나요?", "아니요. 원본 HEIC 파일은 그대로 두고 변환된 새 JPG 파일을 저장합니다."],
      ["파일이 서버로 올라가나요?", "아니요. HEIC 처리는 브라우저 안에서 실행하며 원본 파일과 파일명은 서버로 보내지 않습니다."],
      ["변환 후 PDF로 제출할 수 있나요?", "JPG로 저장한 뒤 JPG PDF 변환 도구에서 여러 장을 한 파일로 묶을 수 있습니다."]
    ],
    relatedProblemIds: ["file-format-error", "photo-under-1mb", "images-to-one-pdf"]
  },
  {
    id: "photo-under-1mb",
    slug: "photo-under-1mb",
    path: "/problems/photo-under-1mb/",
    title: "사진 1MB 이하로 줄이기",
    shortTitle: "1MB 압축",
    description: "업로드 용량 초과가 뜰 때 사진을 1MB, 500KB, 3MB 기준으로 압축합니다.",
    metaDescription:
      "사진 1MB 이하로 줄이기, 500KB 압축, JPG 용량 줄이기를 무료로 처리하세요. 브라우저에서 압축하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "사진 1MB 이하로 줄이기",
    secondaryQueries: ["사진 용량 줄이기", "500KB 사진 압축", "JPG 용량 줄이기"],
    intentQueries: [
      "업로드 용량 초과",
      "사진 용량 초과",
      "이미지 용량 초과",
      "1메가 이하",
      "1mb 이하",
      "500kb 이하",
      "3mb 이하",
      "사진 압축",
      "증빙 사진 용량"
    ],
    targetToolId: "image-compressor",
    targetPath: "/tools/photo-size-reducer/?preset=1mb",
    targetLabel: "사진 1MB 압축 시작",
    targetPreset: "1mb",
    heroBadges: ["무료", "설치 없음", "서버 전송 없음"],
    actionNote: "1MB 이하와 JPG 출력 기본값으로 열고, 필요하면 500KB나 3MB 기준으로 바꿉니다.",
    steps: ["사진 선택", "1MB 목표 확인", "압축 실행", "저장 후 제출"],
    faqs: [
      ["1MB 이하로 줄이면 화질이 많이 깨지나요?", "사진 크기와 원본 품질에 따라 다르지만, 제출용 문서 사진은 75~85 품질이 무난한 경우가 많습니다."],
      ["500KB 제한도 가능한가요?", "사진 용량 줄이기 도구에서 500KB, 1MB, 3MB 기준을 선택할 수 있습니다."],
      ["PNG도 줄일 수 있나요?", "JPG, PNG, WebP 파일을 선택할 수 있고 제출 호환성이 중요하면 JPG 출력이 좋습니다."],
      ["파일이 서버로 올라가나요?", "아니요. 이미지는 브라우저 캔버스에서 처리하고 원본 파일과 파일명은 서버로 보내지 않습니다."],
      ["여러 장도 한 번에 압축되나요?", "최대 20장, 총 50MB까지 한 번에 처리할 수 있습니다."]
    ],
    relatedProblemIds: ["image-pixel-limit", "images-to-one-pdf", "heic-jpg-submit"]
  },
  {
    id: "image-pixel-limit",
    slug: "image-pixel-limit",
    path: "/problems/image-pixel-limit/",
    title: "사진 크기 제한 맞추기",
    shortTitle: "크기 제한",
    description: "가로·세로 픽셀 제한이 있을 때 긴 변 1200px 기준으로 이미지를 줄입니다.",
    metaDescription:
      "사진 크기 제한이나 픽셀 제한이 있을 때 이미지를 긴 변 1200px 기준으로 줄이세요. 브라우저에서 무료로 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "사진 크기 제한",
    secondaryQueries: ["이미지 크기 줄이기", "사진 해상도 줄이기", "이미지 리사이즈"],
    intentQueries: [
      "가로 세로 제한",
      "픽셀 제한",
      "해상도 초과",
      "사진 크기 초과",
      "긴 변 줄이기",
      "1200px",
      "800px",
      "이미지 사이즈 줄이기"
    ],
    targetToolId: "image-resizer",
    targetPath: "/tools/image-resizer/?preset=long-1200",
    targetLabel: "1200px 리사이즈",
    targetPreset: "long-1200",
    actionNote: "긴 변 기준으로 줄여 비율을 유지하고 제출 가능한 크기로 맞춥니다.",
    steps: ["이미지 선택", "긴 변 1200px 확인", "리사이즈 저장", "용량도 크면 압축"],
    faqs: [
      ["긴 변 1200px은 무슨 뜻인가요?", "가로와 세로 중 더 긴 쪽을 1200px로 맞추고 원본 비율을 유지하는 방식입니다."],
      ["가로·세로를 직접 입력할 수 있나요?", "네. 이미지 리사이즈 도구에서 직접 크기 모드로 원하는 픽셀을 입력할 수 있습니다."],
      ["크기를 줄이면 용량도 줄어드나요?", "대부분 줄어듭니다. 그래도 용량 제한을 넘으면 사진 용량 줄이기 도구로 한 번 더 압축하세요."],
      ["파일이 서버로 올라가나요?", "아니요. 이미지는 브라우저에서만 처리하고 원본 파일과 파일명은 서버로 보내지 않습니다."],
      ["여러 장도 가능한가요?", "최대 20장, 총 50MB까지 한 번에 리사이즈할 수 있습니다."]
    ],
    relatedProblemIds: ["photo-under-1mb", "document-photo-crop", "sideways-scan"]
  },
  {
    id: "sideways-scan",
    slug: "sideways-scan",
    path: "/problems/sideways-scan/",
    title: "사진 방향 바로잡기",
    shortTitle: "방향 오류",
    description: "스캔본이나 휴대폰 사진이 옆으로 누웠을 때 오른쪽 90도 회전으로 시작합니다.",
    metaDescription:
      "스캔본이나 휴대폰 사진이 옆으로 돌아갔을 때 브라우저에서 오른쪽, 왼쪽, 180도로 회전하세요. 설치 없이 무료로 처리합니다.",
    primaryQuery: "사진 방향 돌리기",
    secondaryQueries: ["이미지 회전", "스캔본 회전", "JPG 회전"],
    intentQueries: [
      "사진이 옆으로",
      "사진 옆으로 돌아감",
      "스캔본 옆으로",
      "이미지 방향 오류",
      "jpg 방향 돌리기",
      "90도 회전",
      "사진 거꾸로",
      "휴대폰 사진 회전"
    ],
    targetToolId: "image-rotator",
    targetPath: "/tools/image-rotator/?preset=right",
    targetLabel: "오른쪽 90도 회전",
    targetPreset: "right",
    actionNote: "가장 흔한 오른쪽 90도 회전 설정으로 열고 필요하면 방향을 바꿉니다.",
    steps: ["사진 선택", "회전 방향 확인", "회전 파일 저장", "여백이 크면 자르기"],
    faqs: [
      ["사진이 왜 옆으로 보이나요?", "휴대폰이나 스캐너가 저장한 방향 정보와 제출처 미리보기 방식이 달라서 옆으로 보일 수 있습니다."],
      ["왼쪽이나 180도 회전도 되나요?", "네. 이미지 회전 도구에서 왼쪽 90도, 오른쪽 90도, 180도를 선택할 수 있습니다."],
      ["여러 장을 한 번에 돌릴 수 있나요?", "네. 같은 방향으로 회전할 사진을 여러 장 선택해 한 번에 처리할 수 있습니다."],
      ["파일이 서버로 올라가나요?", "아니요. 이미지는 브라우저에서 다시 그려 저장하고 원본 파일과 파일명은 서버로 보내지 않습니다."],
      ["회전 후 PDF로 묶을 수 있나요?", "회전한 이미지를 저장한 뒤 JPG PDF 변환 도구에서 한 파일로 묶을 수 있습니다."]
    ],
    relatedProblemIds: ["document-photo-crop", "images-to-one-pdf", "image-pixel-limit"]
  },
  {
    id: "document-photo-crop",
    slug: "document-photo-crop",
    path: "/problems/document-photo-crop/",
    title: "문서 사진 여백 자르기",
    shortTitle: "여백 자르기",
    description: "책상, 바닥, 빈 여백이 함께 찍힌 문서 사진에서 필요한 영역만 남깁니다.",
    metaDescription:
      "문서 사진의 배경이나 여백이 너무 많을 때 브라우저에서 필요한 영역만 자르세요. 설치 없이 무료로 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "문서 사진 자르기",
    secondaryQueries: ["이미지 자르기", "사진 크롭", "스캔본 여백 제거"],
    intentQueries: [
      "문서 여백 제거",
      "사진 여백 자르기",
      "스캔본 여백",
      "배경 잘라내기",
      "책상 배경 제거",
      "문서만 남기기",
      "사진 크롭",
      "제출 사진 자르기"
    ],
    targetToolId: "image-cropper",
    targetPath: "/tools/image-cropper/?preset=document",
    targetLabel: "문서 영역 자르기",
    targetPreset: "document",
    actionNote: "문서 영역 자르기 설정으로 열어 불필요한 배경을 먼저 줄입니다.",
    steps: ["문서 사진 선택", "자르기 영역 조정", "잘라낸 파일 저장", "필요하면 방향·용량 정리"],
    faqs: [
      ["문서 사진 여백은 왜 줄이는 게 좋나요?", "제출처 미리보기에서 글자가 작게 보이거나 배경이 많이 들어가면 확인이 어려울 수 있습니다."],
      ["정사각형이나 3:4 비율도 가능한가요?", "네. 이미지 자르기 도구에서 정사각형, 3:4, 4:3, 16:9, 자유 비율을 선택할 수 있습니다."],
      ["픽셀 좌표를 직접 넣을 수 있나요?", "네. 자를 영역의 X, Y, 가로, 세로 값을 직접 조정할 수 있습니다."],
      ["파일이 서버로 올라가나요?", "아니요. 이미지는 브라우저 캔버스에서 처리하고 원본 파일과 파일명은 서버로 보내지 않습니다."],
      ["여러 장을 한 번에 자를 수 있나요?", "자르기는 영역 확인이 필요해서 현재는 한 장씩 처리합니다."]
    ],
    relatedProblemIds: ["sideways-scan", "image-pixel-limit", "images-to-one-pdf"]
  },
  {
    id: "images-to-one-pdf",
    slug: "images-to-one-pdf",
    path: "/problems/images-to-one-pdf/",
    title: "사진 여러 장 PDF로 묶기",
    shortTitle: "사진 PDF",
    description: "증빙 사진이나 스캔 이미지를 순서대로 정리해 한 개의 제출용 PDF로 저장합니다.",
    metaDescription:
      "사진 여러 장 PDF 변환, 스캔 이미지 PDF 만들기, JPG PDF 변환을 무료로 처리하세요. 브라우저에서 묶고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "사진 여러 장 PDF",
    secondaryQueries: ["JPG PDF 변환", "사진 PDF 변환", "스캔 이미지 PDF"],
    intentQueries: [
      "사진 여러장 pdf",
      "이미지 여러장 pdf",
      "jpg 여러장 pdf",
      "스캔 이미지 pdf",
      "스캔본 pdf 만들기",
      "제출용 pdf 만들기",
      "증빙사진 pdf",
      "사진 합쳐서 pdf",
      "한 파일로 제출"
    ],
    targetToolId: "jpg-to-pdf",
    targetPath: "/tools/jpg-to-pdf-converter/",
    targetLabel: "JPG PDF 변환 시작",
    heroBadges: ["무료", "설치 없음", "서버 전송 없음"],
    actionNote: "사진을 선택한 순서대로 PDF 페이지로 묶고, 필요하면 드래그로 순서를 바꿉니다.",
    steps: ["사진 여러 장 선택", "페이지 순서 확인", "A4 방향·여백 선택", "PDF 저장"],
    faqs: [
      ["여러 장을 한 PDF로 만들 수 있나요?", "네. JPG, PNG, WebP 사진을 선택한 순서대로 한 개의 PDF로 묶을 수 있습니다."],
      ["이미지 순서를 바꿀 수 있나요?", "네. 목록에서 위아래 버튼이나 끌어서 놓기로 PDF 페이지 순서를 조정할 수 있습니다."],
      ["A4 크기로 저장할 수 있나요?", "A4 세로와 A4 가로를 선택할 수 있고 이미지 비율을 유지해 페이지 안에 맞춥니다."],
      ["파일이 서버로 올라가나요?", "아니요. 이미지는 브라우저에서 읽고 PDF도 브라우저 안에서 만듭니다."],
      ["PDF로 묶기 전에 무엇을 확인해야 하나요?", "형식 오류, 용량 초과, 방향 오류, 여백 문제를 먼저 정리하면 제출 실패를 줄일 수 있습니다."]
    ],
    relatedProblemIds: ["photo-under-1mb", "file-format-error", "sideways-scan"]
  }
];

export function getProblemPage(id: ProblemPageId): ProblemPage {
  const page = problemPages.find((item) => item.id === id);
  if (!page) throw new Error(`Unknown problem page: ${id}`);
  return page;
}
