export type ToolId =
  | "business-nameplate"
  | "transaction-statement"
  | "estimate"
  | "receipt"
  | "invoice"
  | "vat-calculator"
  | "amount-korean"
  | "withholding-tax"
  | "stamp-background"
  | "jpg-to-pdf"
  | "image-compressor"
  | "image-resizer"
  | "image-cropper"
  | "image-rotator"
  | "image-converter"
  | "heic-to-jpg";

export type ToolCategoryId = "business" | "pdf" | "image";

export type ToolCategory = {
  id: ToolCategoryId;
  title: string;
  shortTitle: string;
  path: string;
  description: string;
  status: "active" | "planned";
};

export type ToolInfo = {
  id: ToolId;
  title: string;
  shortTitle: string;
  path: string;
  category: ToolCategoryId;
  description: string;
  pageTitle: string;
  metaDescription: string;
  primaryQuery: string;
  secondaryQueries: string[];
  userMoment: string;
  featureList: string[];
  faqs: [question: string, answer: string][];
  trustNote: string;
  relatedToolIds: ToolId[];
};

export const toolCategories: ToolCategory[] = [
  {
    id: "business",
    title: "업무 문서 도구",
    shortTitle: "업무 문서",
    path: "/categories/business/",
    description:
      "거래명세서, 견적서, 청구서, 영수증, 부가세 계산, 한글 금액 변환, 3.3% 계산, 도장 배경 제거처럼 제출 직전에 필요한 한국형 업무 문서를 브라우저에서 작성합니다.",
    status: "active"
  },
  {
    id: "pdf",
    title: "PDF 도구",
    shortTitle: "PDF",
    path: "/categories/pdf/",
    description:
      "JPG, PNG, WebP 이미지를 PDF로 묶는 파일 도구를 한국 업무 문서 제출 흐름에 맞춰 브라우저에서 처리합니다.",
    status: "active"
  },
  {
    id: "image",
    title: "이미지 도구",
    shortTitle: "이미지",
    path: "/categories/image/",
    description:
      "사진과 이미지 파일을 제출하기 좋은 크기, 용량, 형식으로 브라우저에서 정리합니다.",
    status: "active"
  }
];

export const tools: ToolInfo[] = [
  {
    id: "business-nameplate",
    title: "사업자 명판 만들기 무료",
    shortTitle: "명판",
    path: "/tools/business-nameplate-maker/",
    category: "business",
    description:
      "상호, 대표자, 사업자등록번호, 주소를 입력해 문서에 넣을 수 있는 사업자 명판 이미지를 만듭니다.",
    pageTitle: "사업자 명판 만들기 무료 - PNG 저장",
    metaDescription:
      "사업자명, 대표자, 사업자등록번호, 주소를 입력해 문서에 넣을 명판 PNG를 무료로 만드세요. 설치 없이 브라우저에서 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "사업자 명판 만들기 무료",
    secondaryQueries: ["사업자 명판 이미지", "전자 사업자 명판", "명판 도장 합성 이미지"],
    userMoment: "계약서, 견적서, 거래명세서에 회사 정보를 반복해서 넣어야 하는 순간",
    featureList: [
      "사업자 정보 이미지 미리보기",
      "도장 이미지 합성",
      "투명 배경 PNG 저장",
      "브라우저 안에서 파일 처리"
    ],
    faqs: [
      [
        "사업자 명판 이미지는 어디에 쓰나요?",
        "거래명세서, 견적서, 계약서, 안내문처럼 회사 정보를 반복해서 넣는 문서에 이미지로 삽입할 때 씁니다."
      ],
      [
        "법적 효력이 있나요?",
        "이 도구는 문서 삽입용 이미지를 만드는 용도입니다. 인감 증명이나 전자서명 인증을 대신하지 않습니다."
      ],
      [
        "입력한 정보가 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서 처리하는 것입니다. 입력값과 이미지 파일을 서버로 업로드하지 않습니다."
      ],
      ["배경을 투명하게 만들 수 있나요?", "네. 투명 배경 또는 흰색 배경을 선택할 수 있습니다."],
      ["도장 이미지를 같이 넣을 수 있나요?", "PNG/JPG 도장 이미지를 선택하면 미리보기에 함께 배치할 수 있습니다."]
    ],
    trustNote: "문서 삽입용 이미지 생성 도구이며, 법적 효력이나 인감 증명을 대신하지 않습니다.",
    relatedToolIds: ["stamp-background", "transaction-statement"]
  },
  {
    id: "transaction-statement",
    title: "거래명세서 자동작성",
    shortTitle: "거래명세서",
    path: "/tools/transaction-statement-generator/",
    category: "business",
    description:
      "공급자, 거래처, 품목, 수량, 단가를 입력해 거래명세서를 바로 작성하고 인쇄합니다.",
    pageTitle: "거래명세서 자동작성 - 무료 양식 PDF 저장",
    metaDescription:
      "공급자, 거래처, 품목, 수량, 단가를 입력해 거래명세서를 무료로 작성하세요. 설치 없이 브라우저에서 인쇄하고 PDF로 저장합니다.",
    primaryQuery: "거래명세서 자동작성",
    secondaryQueries: ["거래명세서 양식 무료", "거래명세표 양식", "거래명세서 PDF"],
    userMoment: "거래 내역을 거래처에 바로 보내거나 PDF로 저장해야 하는 순간",
    featureList: [
      "거래명세서 품목 행 추가",
      "부가세 포함/별도/없음 계산",
      "합계 한글 금액 표기",
      "인쇄 및 PDF 저장",
      "브라우저 안에서 문서 작성"
    ],
    faqs: [
      [
        "거래명세서와 세금계산서는 다른가요?",
        "네. 거래명세서는 거래 내역을 정리해 전달하는 문서이고, 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."
      ],
      ["부가세 포함 금액도 계산할 수 있나요?", "부가세 별도, 포함, 없음 중에서 선택할 수 있습니다."],
      ["PDF로 저장할 수 있나요?", "브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      [
        "입력한 거래처 정보가 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 문서 정보는 서버로 보내지 않습니다."
      ],
      ["모바일에서도 작성할 수 있나요?", "모바일 입력과 미리보기를 지원하되, 최종 인쇄는 데스크톱 브라우저가 더 안정적입니다."]
    ],
    trustNote: "일반 거래 내역 정리용 양식입니다. 세금계산서나 전자세금계산서 발행을 대신하지 않습니다.",
    relatedToolIds: ["vat-calculator", "amount-korean"]
  },
  {
    id: "estimate",
    title: "견적서 자동작성",
    shortTitle: "견적서",
    path: "/tools/estimate-generator/",
    category: "business",
    description:
      "고객명, 품목, 수량, 단가를 입력해 견적서를 무료로 작성하고 인쇄합니다.",
    pageTitle: "견적서 자동작성 - 무료 견적서 양식",
    metaDescription:
      "고객명, 품목, 수량, 단가를 입력해 견적서를 무료로 작성하세요. 브라우저에서 바로 미리보기와 인쇄를 할 수 있습니다.",
    primaryQuery: "견적서 자동작성",
    secondaryQueries: ["견적서 양식 무료", "무료 견적서 양식", "견적서 PDF"],
    userMoment: "거래 전 예상 금액과 조건을 고객에게 빠르게 전달해야 하는 순간",
    featureList: [
      "견적서 품목 행 추가",
      "부가세 포함/별도/없음 계산",
      "견적 유효기간 표시",
      "합계 한글 금액 표기",
      "인쇄 및 PDF 저장",
      "브라우저 안에서 문서 작성"
    ],
    faqs: [
      [
        "견적서와 거래명세서는 어떻게 다른가요?",
        "견적서는 거래 전에 예상 금액과 조건을 제안하는 문서이고, 거래명세서는 실제 거래 내역을 정리하는 문서입니다."
      ],
      ["부가세 포함 견적도 만들 수 있나요?", "부가세 별도, 포함, 없음 중에서 선택할 수 있습니다."],
      ["견적 유효기간을 넣을 수 있나요?", "유효기간 필드를 입력하면 미리보기에 함께 표시됩니다."],
      ["PDF로 저장할 수 있나요?", "브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      [
        "입력한 고객 정보가 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 문서 정보는 서버로 보내지 않습니다."
      ]
    ],
    trustNote: "견적 전달용 문서 생성 도구입니다. 계약 체결이나 세금계산서 발행을 대신하지 않습니다.",
    relatedToolIds: ["vat-calculator", "invoice"]
  },
  {
    id: "receipt",
    title: "영수증 자동작성",
    shortTitle: "영수증",
    path: "/tools/receipt-generator/",
    category: "business",
    description:
      "거래일, 공급자, 구매자, 품목, 금액을 입력해 영수증을 무료로 작성하고 인쇄합니다.",
    pageTitle: "영수증 자동작성 - 무료 영수증 양식",
    metaDescription:
      "거래일, 공급자, 구매자, 품목, 금액을 입력해 영수증을 무료로 작성하세요. 브라우저에서 바로 미리보기와 인쇄를 할 수 있습니다.",
    primaryQuery: "영수증 자동작성",
    secondaryQueries: ["영수증 양식 무료", "간이영수증 양식", "청구서 자동작성", "영수증 PDF"],
    userMoment: "결제 내역을 고객에게 바로 전달하거나 내부 정산 자료로 남겨야 하는 순간",
    featureList: [
      "영수증 품목 행 추가",
      "부가세 포함/별도/없음 계산",
      "합계 한글 금액 표기",
      "인쇄 및 PDF 저장",
      "브라우저 안에서 문서 작성"
    ],
    faqs: [
      [
        "이 영수증은 세금계산서나 현금영수증을 대신하나요?",
        "아니요. 이 도구는 거래 내역을 정리하는 일반 양식입니다. 세금계산서, 현금영수증, 카드 매출전표 발행을 대신하지 않습니다."
      ],
      ["간이영수증처럼 사용할 수 있나요?", "간단한 거래 내역 확인용 양식으로 작성할 수 있습니다. 법적·세무 증빙이 필요한 경우 공식 발행 수단을 확인하세요."],
      ["청구서로도 쓸 수 있나요?", "품목과 금액을 정리하는 구조는 비슷하지만, 청구 조건이나 입금기한이 필요한 경우 비고에 명확히 적어두는 것이 좋습니다."],
      ["부가세 포함 금액도 계산할 수 있나요?", "부가세 별도, 포함, 없음 중에서 선택할 수 있습니다."],
      ["PDF로 저장할 수 있나요?", "브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      [
        "입력한 구매자 정보가 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 문서 정보는 서버로 보내지 않습니다."
      ]
    ],
    trustNote: "일반 거래 내역 확인용 양식입니다. 세금계산서, 현금영수증, 카드 매출전표를 대신하지 않습니다.",
    relatedToolIds: ["vat-calculator", "invoice"]
  },
  {
    id: "invoice",
    title: "청구서 자동작성",
    shortTitle: "청구서",
    path: "/tools/invoice-generator/",
    category: "business",
    description:
      "공급자, 고객, 청구 품목, 입금기한, 금액을 입력해 청구서를 무료로 작성하고 인쇄합니다.",
    pageTitle: "청구서 자동작성 - 무료 청구서 양식",
    metaDescription:
      "공급자, 고객, 청구 품목, 입금기한, 금액을 입력해 청구서를 무료로 작성하세요. 브라우저에서 바로 미리보기와 인쇄를 할 수 있습니다.",
    primaryQuery: "청구서 자동작성",
    secondaryQueries: ["청구서 양식 무료", "무료 청구서 양식", "청구서 PDF", "입금 요청서 양식"],
    userMoment: "작업 완료 후 고객에게 청구 금액과 입금기한을 전달해야 하는 순간",
    featureList: [
      "청구서 품목 행 추가",
      "입금기한 표시",
      "부가세 포함/별도/없음 계산",
      "합계 한글 금액 표기",
      "인쇄 및 PDF 저장",
      "브라우저 안에서 문서 작성"
    ],
    faqs: [
      [
        "청구서와 세금계산서는 다른가요?",
        "네. 청구서는 대금 지급을 요청하는 일반 문서이고, 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."
      ],
      ["입금기한을 넣을 수 있나요?", "입금기한 필드를 입력하면 미리보기 상단에 함께 표시됩니다."],
      ["계좌번호나 결제 조건을 넣을 수 있나요?", "비고에 계좌번호, 결제 조건, 담당자 연락처 같은 안내를 적을 수 있습니다."],
      ["부가세 포함 청구도 만들 수 있나요?", "부가세 별도, 포함, 없음 중에서 선택할 수 있습니다."],
      ["PDF로 저장할 수 있나요?", "브라우저의 인쇄 기능에서 PDF 저장을 선택할 수 있습니다."],
      [
        "입력한 고객 정보가 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 문서 정보는 서버로 보내지 않습니다."
      ]
    ],
    trustNote: "입금 요청용 일반 문서입니다. 세금계산서, 전자세금계산서, 계약 체결을 대신하지 않습니다.",
    relatedToolIds: ["withholding-tax", "vat-calculator"]
  },
  {
    id: "vat-calculator",
    title: "부가세 계산기",
    shortTitle: "부가세",
    path: "/tools/vat-calculator/",
    category: "business",
    description:
      "공급가액 또는 합계금액을 입력해 부가세와 총액을 빠르게 계산합니다.",
    pageTitle: "부가세 계산기 - 공급가액 부가세 합계금액 계산",
    metaDescription:
      "공급가액 또는 합계금액을 입력해 부가세와 총액을 계산하세요. 일반과세 10% 기준으로 브라우저에서 바로 계산합니다.",
    primaryQuery: "부가세 계산기",
    secondaryQueries: ["부가세 포함 계산", "공급가액 계산기", "부가세 10% 계산", "합계금액 공급가액 계산"],
    userMoment: "견적서, 거래명세서, 청구서 금액을 입력하기 전에 공급가액과 부가세를 빠르게 맞춰야 하는 순간",
    featureList: [
      "공급가액 기준 계산",
      "합계금액 기준 역산",
      "부가세 10% 계산",
      "계산 결과 복사",
      "브라우저 안에서 즉시 계산"
    ],
    faqs: [
      [
        "부가세 계산 기준은 무엇인가요?",
        "일반과세자의 부가가치세율 10% 기준으로 계산합니다. 간이과세, 면세, 영세율, 업종별 특례는 반영하지 않습니다."
      ],
      ["공급가액 기준 계산은 어떻게 하나요?", "입력한 공급가액에 10%를 곱해 부가세를 구하고, 공급가액과 부가세를 더해 합계금액을 표시합니다."],
      ["합계금액 기준 역산은 어떻게 하나요?", "입력한 합계금액을 1.1로 나누어 공급가액을 구하고, 합계금액에서 공급가액을 뺀 금액을 부가세로 표시합니다."],
      ["원 단위 반올림은 어떻게 처리하나요?", "브라우저 계산 결과는 원 단위로 반올림해 표시합니다. 내부 회계 기준이 따로 있으면 그 기준을 우선하세요."],
      ["세금 신고용으로 써도 되나요?", "이 도구는 문서 작성 전 금액 확인용입니다. 신고, 공제, 과세 여부 판단은 홈택스나 세무 전문가의 확인이 필요합니다."],
      [
        "입력한 금액이 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 입력한 금액은 서버로 보내지 않습니다."
      ]
    ],
    trustNote: "일반과세 10% 기준의 금액 확인용 계산기입니다. 세무 신고나 과세 여부 판단을 대신하지 않습니다.",
    relatedToolIds: ["amount-korean", "invoice"]
  },
  {
    id: "amount-korean",
    title: "금액 한글 변환기",
    shortTitle: "금액변환",
    path: "/tools/amount-korean-converter/",
    category: "business",
    description:
      "숫자 금액을 계약서, 청구서, 견적서에 넣기 좋은 한글 금액 표기로 변환합니다.",
    pageTitle: "금액 한글 변환기 - 숫자 금액을 한글 표기로 변환",
    metaDescription:
      "숫자 금액을 입력해 계약서, 청구서, 견적서에 넣기 좋은 한글 금액 표기로 변환하세요. 브라우저에서 바로 복사할 수 있습니다.",
    primaryQuery: "금액 한글 변환기",
    secondaryQueries: ["숫자 한글 변환", "한글 금액 변환", "계약서 금액 한글", "금 일백만원정"],
    userMoment: "계약서, 청구서, 견적서에 숫자 금액과 한글 금액을 함께 넣어야 하는 순간",
    featureList: [
      "숫자 금액 한글 표기 변환",
      "금액 앞 금, 뒤 원정 표기",
      "쉼표가 들어간 금액 자동 처리",
      "변환 결과 복사",
      "브라우저 안에서 즉시 변환"
    ],
    faqs: [
      [
        "금액 한글 표기는 어디에 쓰나요?",
        "계약서, 견적서, 청구서, 영수증처럼 숫자 금액 옆에 한글 금액을 함께 적어 금액 오독을 줄이고 싶을 때 씁니다."
      ],
      ["원정 표기도 만들 수 있나요?", "네. 숫자 금액을 입력하면 '금 일백만원정'처럼 앞에 금, 뒤에 원정을 붙인 표기를 함께 보여줍니다."],
      ["음수나 소수도 지원하나요?", "현재 도구는 원 단위의 0 이상 정수 금액만 지원합니다. 외화, 소수, 마이너스 금액은 문서 목적에 맞게 별도로 확인하세요."],
      ["복사해서 문서에 붙여 넣을 수 있나요?", "복사 버튼을 누르면 '금 ... 원정' 형식의 결과를 클립보드에 복사할 수 있습니다."],
      [
        "입력한 금액이 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 입력한 금액은 서버로 보내지 않습니다."
      ],
      [
        "법적 효력이 있나요?",
        "이 도구는 문서 작성을 돕는 표기 변환 도구입니다. 계약서나 증빙 문서의 법적 효력을 보장하지 않습니다."
      ]
    ],
    trustNote: "문서 작성을 돕는 표기 변환 도구입니다. 계약서나 증빙 문서의 법적 효력을 보장하지 않습니다.",
    relatedToolIds: ["invoice", "estimate"]
  },
  {
    id: "withholding-tax",
    title: "3.3% 계산기",
    shortTitle: "3.3%",
    path: "/tools/freelance-withholding-calculator/",
    category: "business",
    description:
      "프리랜서와 인적용역 사업소득의 3.3% 원천징수액과 실수령액을 계산합니다.",
    pageTitle: "3.3% 계산기 - 프리랜서 원천징수 실수령액 계산",
    metaDescription:
      "프리랜서, 인적용역 사업소득의 총 지급액 또는 실수령액을 입력해 사업소득세 3%, 개인지방소득세 0.3%, 실수령액을 계산하세요.",
    primaryQuery: "3.3% 계산기",
    secondaryQueries: ["프리랜서 세금 계산기", "사업소득 원천징수 계산", "3.3 세금 계산", "프리랜서 실수령액 계산"],
    userMoment: "프리랜서 용역비를 청구하거나 지급 전에 원천징수액과 실수령액을 맞춰야 하는 순간",
    featureList: [
      "총 지급액 기준 3.3% 계산",
      "실수령액 기준 총 지급액 역산",
      "사업소득세 3% 계산",
      "개인지방소득세 0.3% 계산",
      "계산 결과 복사",
      "브라우저 안에서 즉시 계산"
    ],
    faqs: [
      [
        "3.3%는 무엇인가요?",
        "국세청 안내 기준으로 인적용역 사업소득 지급 시 사업소득세 3%와 개인지방소득세 0.3%를 합한 원천징수율입니다."
      ],
      ["총 지급액 기준 계산은 어떻게 하나요?", "입력한 총 지급액에 3%를 곱해 사업소득세를, 0.3%를 곱해 개인지방소득세를 계산하고 이를 뺀 금액을 실수령액으로 표시합니다."],
      ["실수령액으로 총 지급액을 역산할 수 있나요?", "네. 실수령액을 96.7%로 나누어 총 지급액을 추정하고, 그 금액 기준으로 원천징수액을 계산합니다."],
      ["근로소득이나 기타소득에도 쓰면 되나요?", "아니요. 이 도구는 인적용역 사업소득 3.3% 간편 계산용입니다. 근로소득, 기타소득, 법인 지급, 비거주자 지급은 다른 기준이 적용될 수 있습니다."],
      ["신고용 세액으로 확정해도 되나요?", "이 도구는 문서 작성 전 금액 확인용입니다. 실제 신고, 환급, 소득 구분, 필요경비 판단은 홈택스나 세무 전문가의 확인이 필요합니다."],
      [
        "입력한 금액이 서버에 저장되나요?",
        "v1 원칙은 브라우저 안에서만 처리하는 것입니다. 입력한 금액은 서버로 보내지 않습니다."
      ]
    ],
    trustNote: "인적용역 사업소득 3.3% 기준의 간편 계산기입니다. 신고, 환급, 소득 구분 판단을 대신하지 않습니다.",
    relatedToolIds: ["invoice", "receipt"]
  },
  {
    id: "stamp-background",
    title: "도장 배경 제거",
    shortTitle: "도장배경제거",
    path: "/tools/stamp-background-remover/",
    category: "business",
    description:
      "스캔하거나 촬영한 도장 이미지의 흰 배경을 제거해 문서에 넣기 좋은 투명 PNG로 저장합니다.",
    pageTitle: "도장 배경 제거 - 스캔 도장 투명 PNG 만들기",
    metaDescription:
      "스캔하거나 촬영한 도장 이미지의 흰 배경을 브라우저에서 제거하고 투명 PNG로 저장하세요. 업로드한 이미지는 서버로 보내지 않습니다.",
    primaryQuery: "도장 배경 제거",
    secondaryQueries: ["도장 누끼 따기", "스캔 도장 투명하게", "도장 PNG 만들기", "도장 배경 투명"],
    userMoment: "종이에 찍은 도장을 문서 명판, 견적서, 거래명세서에 투명 이미지로 넣어야 하는 순간",
    featureList: [
      "도장 이미지 흰 배경 제거",
      "배경 제거 강도 조절",
      "붉은 도장 선명화",
      "투명 PNG 저장",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "어떤 이미지에 잘 맞나요?",
        "흰 종이에 찍은 붉은 도장, 검은 서명, 스캔 도장처럼 배경이 밝고 도장 선이 뚜렷한 이미지에 잘 맞습니다."
      ],
      ["도장 이미지가 서버에 업로드되나요?", "아니요. 이미지는 브라우저 안의 캔버스에서 처리하고 서버로 보내지 않습니다."],
      ["배경 제거 강도는 어떻게 조절하나요?", "배경 제거 강도를 높이면 더 많은 밝은 배경이 투명해지고, 낮추면 연한 도장 선을 더 보존합니다."],
      ["결과 파일 형식은 무엇인가요?", "투명 배경을 지원하는 PNG 파일로 저장합니다."],
      ["명판 만들기와 같이 쓸 수 있나요?", "네. 배경을 제거한 PNG를 사업자 명판 만들기의 도장 이미지로 선택하면 문서용 명판에 합성할 수 있습니다."],
      [
        "법적 효력이 있나요?",
        "이 도구는 이미지 배경을 정리하는 보조 도구입니다. 인감 증명, 전자서명, 법적 인증을 대신하지 않습니다."
      ]
    ],
    trustNote: "이미지 배경 정리 도구이며, 인감 증명이나 전자서명 인증을 대신하지 않습니다.",
    relatedToolIds: ["business-nameplate", "invoice"]
  },
  {
    id: "jpg-to-pdf",
    title: "JPG PDF 변환",
    shortTitle: "JPG PDF",
    path: "/tools/jpg-to-pdf-converter/",
    category: "pdf",
    description:
      "JPG, PNG, WebP 이미지를 한 개의 PDF로 묶어 제출용 파일로 저장합니다.",
    pageTitle: "JPG PDF 변환 - 이미지 여러 장 PDF 만들기 무료",
    metaDescription:
      "JPG, PNG, WebP 이미지를 무료로 PDF 한 개로 묶어 저장하세요. 설치 없이 브라우저에서 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "JPG PDF 변환",
    secondaryQueries: ["이미지 PDF 변환", "사진 PDF 만들기", "JPG PDF 만들기", "PNG PDF 변환"],
    userMoment: "스캔한 서류 사진이나 증빙 이미지를 하나의 PDF로 제출해야 하는 순간",
    featureList: [
      "여러 이미지 PDF 묶기",
      "이미지 순서 조정",
      "제출 전 마지막 확인",
      "A4 세로/가로 PDF 생성",
      "여백 선택",
      "샘플 이미지로 즉시 테스트",
      "브라우저 안에서 파일 처리"
    ],
    faqs: [
      [
        "이미지가 서버에 업로드되나요?",
        "아니요. 이미지는 브라우저에서 읽고 PDF도 브라우저 안에서 만듭니다. 원본 파일과 파일명은 서버로 보내지 않습니다."
      ],
      ["JPG만 가능한가요?", "JPG, PNG, WebP 이미지를 선택할 수 있습니다. PDF 저장 시에는 제출 호환성을 위해 흰 배경 JPG 이미지로 정리해 묶습니다."],
      ["여러 장을 한 PDF로 만들 수 있나요?", "네. 여러 이미지를 선택하면 선택한 순서대로 한 장씩 PDF 페이지가 됩니다."],
      [
        "이미지 순서를 바꿀 수 있나요?",
        "네. 이미지 선택 후 목록을 끌거나 위/아래 버튼으로 PDF 페이지 순서를 조정할 수 있습니다. 잘못 넣은 이미지는 목록에서 삭제할 수 있습니다."
      ],
      ["A4 크기로 만들 수 있나요?", "A4 세로와 A4 가로를 선택할 수 있고, 이미지 원본 비율을 유지해 페이지 안에 맞춥니다."],
      ["파일 제한이 있나요?", "브라우저 성능을 위해 최대 20장, 총 50MB, 파일당 12MB까지 처리합니다."],
      [
        "법적 효력이 있나요?",
        "이 도구는 이미지 파일을 PDF로 묶는 보조 도구입니다. 제출처의 원본성, 서명, 증빙 요건은 별도로 확인하세요."
      ]
    ],
    trustNote: "이미지는 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["image-compressor", "image-resizer"]
  },
  {
    id: "image-compressor",
    title: "사진 용량 줄이기",
    shortTitle: "사진압축",
    path: "/tools/photo-size-reducer/",
    category: "image",
    description:
      "JPG, PNG, WebP 사진과 이미지를 브라우저에서 압축해 제출 가능한 용량으로 줄입니다.",
    pageTitle: "사진 용량 줄이기 - 1MB 이미지 압축 무료",
    metaDescription:
      "JPG, PNG, WebP 사진 용량을 1MB, 500KB, 3MB 기준으로 무료 압축하세요. 설치 없이 브라우저에서 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "사진 용량 줄이기",
    secondaryQueries: ["이미지 압축", "JPG 용량 줄이기", "PNG 용량 줄이기", "사진 파일 크기 줄이기"],
    userMoment: "사진 파일이 이메일, 관공서, 학교, 회사 시스템 업로드 제한보다 클 때",
    featureList: [
      "여러 이미지 일괄 압축",
      "제출 기준 프리셋",
      "PDF 묶기 다음 단계",
      "JPG/WebP 출력 선택",
      "품질 조절",
      "최대 긴 변 크기 조절",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "사진이 서버에 업로드되나요?",
        "아니요. 선택한 이미지는 브라우저 캔버스에서만 처리하고 서버로 보내지 않습니다."
      ],
      ["여러 장을 한 번에 줄일 수 있나요?", "네. 최대 20장, 총 50MB까지 선택해 한 번에 압축할 수 있습니다."],
      ["JPG와 PNG 모두 가능한가요?", "JPG, PNG, WebP 이미지를 선택할 수 있고, 출력은 제출 호환성이 좋은 JPG 또는 용량 효율이 좋은 WebP 중에서 고를 수 있습니다."],
      ["이미지 크기도 줄일 수 있나요?", "네. 긴 변 기준으로 1200px, 1600px, 2000px 또는 원본 크기를 선택할 수 있습니다."],
      ["화질은 어떻게 조절하나요?", "품질 값을 높이면 화질이 좋아지고 파일이 커질 수 있습니다. 제출용은 75~85 정도가 무난합니다."],
      [
        "원본 파일이 바뀌나요?",
        "아니요. 원본 파일은 그대로 두고 압축된 새 이미지 파일을 저장합니다."
      ]
    ],
    trustNote: "이미지는 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["image-resizer", "image-cropper"]
  },
  {
    id: "image-resizer",
    title: "이미지 리사이즈",
    shortTitle: "리사이즈",
    path: "/tools/image-resizer/",
    category: "image",
    description:
      "JPG, PNG, WebP 이미지를 브라우저에서 원하는 가로·세로 또는 긴 변 크기로 줄입니다.",
    pageTitle: "이미지 리사이즈 - 사진 픽셀 크기 줄이기 무료",
    metaDescription:
      "JPG, PNG, WebP 사진의 픽셀 크기를 무료로 줄이세요. 설치 없이 긴 변 1200px, 800×800, 직접 가로·세로 입력을 브라우저에서 처리합니다.",
    primaryQuery: "이미지 리사이즈",
    secondaryQueries: ["사진 크기 줄이기", "이미지 크기 줄이기", "JPG 사이즈 줄이기", "사진 해상도 줄이기"],
    userMoment: "사진이 제출처의 픽셀 크기 제한보다 크거나 문서 삽입용 이미지 크기를 맞춰야 할 때",
    featureList: [
      "여러 이미지 일괄 리사이즈",
      "긴 변 기준 크기 조절",
      "가로·세로 직접 지정",
      "JPG/PNG/WebP 출력 선택",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "이미지가 서버에 업로드되나요?",
        "아니요. 선택한 이미지는 브라우저 캔버스에서만 처리하고 서버로 보내지 않습니다."
      ],
      ["긴 변 기준 리사이즈가 뭔가요?", "가로와 세로 중 더 긴 쪽을 지정한 픽셀에 맞추고 원본 비율을 유지하는 방식입니다."],
      ["가로 세로를 직접 지정할 수 있나요?", "네. 직접 크기 모드에서 가로와 세로 픽셀을 입력하면 해당 크기로 저장합니다."],
      ["여러 장을 한 번에 바꿀 수 있나요?", "네. 최대 20장, 총 50MB까지 선택해 한 번에 리사이즈할 수 있습니다."],
      ["출력 형식은 무엇을 지원하나요?", "JPG, PNG, WebP로 저장할 수 있습니다. 제출 호환성이 중요하면 JPG를 추천합니다."],
      [
        "원본 파일이 바뀌나요?",
        "아니요. 원본 파일은 그대로 두고 리사이즈된 새 이미지 파일을 저장합니다."
      ]
    ],
    trustNote: "이미지는 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["image-cropper", "image-rotator"]
  },
  {
    id: "image-cropper",
    title: "이미지 자르기",
    shortTitle: "이미지자르기",
    path: "/tools/image-cropper/",
    category: "image",
    description:
      "JPG, PNG, WebP 이미지를 브라우저에서 원하는 영역만 잘라 제출용 이미지로 저장합니다.",
    pageTitle: "이미지 자르기 - 사진 여백 크롭 무료",
    metaDescription:
      "JPG, PNG, WebP 사진의 여백과 배경을 무료로 자르세요. 설치 없이 문서 영역, 프로필 정사각형, 3:4 사진을 브라우저에서 처리합니다.",
    primaryQuery: "이미지 자르기",
    secondaryQueries: ["사진 자르기", "사진 크롭", "이미지 크롭", "JPG 자르기"],
    userMoment: "사진에서 불필요한 여백, 배경, 주변 물체를 잘라내고 제출할 영역만 남겨야 할 때",
    featureList: [
      "이미지 영역 자르기",
      "정사각형/3:4/4:3/16:9 비율 선택",
      "좌표와 크기 직접 입력",
      "JPG/PNG/WebP 출력 선택",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "이미지가 서버에 업로드되나요?",
        "아니요. 선택한 이미지는 브라우저 캔버스에서만 처리하고 서버로 보내지 않습니다."
      ],
      ["어떤 파일 형식을 자를 수 있나요?", "JPG, PNG, WebP 이미지를 선택할 수 있고, 결과는 JPG, PNG, WebP로 저장할 수 있습니다."],
      ["정사각형으로 자를 수 있나요?", "네. 기본값은 정사각형이며, 3:4, 4:3, 16:9 또는 자유 비율로도 자를 수 있습니다."],
      ["정확한 픽셀 좌표를 입력할 수 있나요?", "네. 자를 영역의 X, Y, 가로, 세로 값을 직접 입력해 조정할 수 있습니다."],
      ["원본 파일이 바뀌나요?", "아니요. 원본 파일은 그대로 두고 잘라낸 새 이미지 파일을 저장합니다."],
      ["여러 장을 한 번에 자를 수 있나요?", "자르기는 영역을 눈으로 확인해야 하는 작업이라 현재는 한 장씩 처리합니다."]
    ],
    trustNote: "이미지는 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["image-rotator", "image-resizer"]
  },
  {
    id: "image-rotator",
    title: "이미지 회전",
    shortTitle: "이미지회전",
    path: "/tools/image-rotator/",
    category: "image",
    description:
      "JPG, PNG, WebP 이미지를 브라우저에서 왼쪽, 오른쪽, 180도로 회전해 제출용 이미지로 저장합니다.",
    pageTitle: "이미지 회전 - 사진 방향 바로잡기 무료",
    metaDescription:
      "옆으로 누운 JPG, PNG, WebP 사진과 스캔본 방향을 무료로 바로잡으세요. 설치 없이 왼쪽 90도, 오른쪽 90도, 180도 회전을 브라우저에서 처리합니다.",
    primaryQuery: "이미지 회전",
    secondaryQueries: ["사진 회전", "JPG 회전", "이미지 방향 돌리기", "스캔본 회전"],
    userMoment: "스캔본이나 휴대폰 사진이 옆으로 누워 있어 제출 전에 방향을 바로잡아야 할 때",
    featureList: [
      "여러 이미지 일괄 회전",
      "왼쪽 90도/오른쪽 90도/180도 회전",
      "JPG/PNG/WebP 출력 선택",
      "JPG/WebP 품질 조절",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "이미지가 서버에 업로드되나요?",
        "아니요. 선택한 이미지는 브라우저 캔버스에서만 처리하고 서버로 보내지 않습니다."
      ],
      ["여러 장을 한 번에 회전할 수 있나요?", "네. 최대 20장, 총 50MB까지 선택해 같은 방향으로 한 번에 회전할 수 있습니다."],
      ["어떤 방향으로 회전할 수 있나요?", "왼쪽 90도, 오른쪽 90도, 180도 회전을 지원합니다."],
      ["출력 형식은 무엇을 지원하나요?", "JPG, PNG, WebP로 저장할 수 있습니다. 제출 호환성이 중요하면 JPG를 추천합니다."],
      ["원본 파일이 바뀌나요?", "아니요. 원본 파일은 그대로 두고 회전된 새 이미지 파일을 저장합니다."],
      ["사진 EXIF 방향 정보도 고쳐지나요?", "이 도구는 브라우저가 읽은 이미지를 실제 픽셀 방향으로 다시 그려 저장합니다. 복잡한 EXIF 메타데이터 보존은 목적에 포함하지 않습니다."]
    ],
    trustNote: "이미지는 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["image-cropper", "jpg-to-pdf"]
  },
  {
    id: "image-converter",
    title: "WebP JPG 변환",
    shortTitle: "WebP 변환",
    path: "/tools/image-converter/",
    category: "image",
    description:
      "WebP, PNG, JPG 이미지를 브라우저에서 JPG, PNG, WebP 형식으로 바꿔 저장합니다.",
    pageTitle: "WebP JPG 변환 - WebP 이미지 JPG 무료 변환",
    metaDescription:
      "WebP 이미지를 JPG로 무료 변환하세요. JPG만 받는 제출처에 맞춰 PNG, JPG, WebP 형식을 설치 없이 브라우저에서 처리합니다.",
    primaryQuery: "WebP JPG 변환",
    secondaryQueries: ["JPG WebP 변환", "PNG JPG 변환", "이미지 형식 변환", "WebP PNG 변환"],
    userMoment: "첨부 시스템이나 문서 편집기가 특정 이미지 형식만 받을 때",
    featureList: [
      "WebP, PNG, JPG 입력 지원",
      "JPG/PNG/WebP 출력 선택",
      "여러 이미지 일괄 변환",
      "JPG/WebP 품질 조절",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "이미지가 서버에 업로드되나요?",
        "아니요. 선택한 이미지는 브라우저 캔버스에서만 처리하고 서버로 보내지 않습니다."
      ],
      ["WebP를 JPG로 바꿀 수 있나요?", "네. WebP 이미지를 선택한 뒤 출력 형식을 JPG로 두고 변환하면 JPG 파일로 저장할 수 있습니다."],
      ["PNG 투명 배경은 유지되나요?", "PNG 또는 WebP로 저장하면 투명 영역을 유지할 수 있습니다. JPG는 투명을 지원하지 않아 흰 배경으로 저장합니다."],
      ["여러 장을 한 번에 바꿀 수 있나요?", "네. 최대 20장, 총 50MB까지 선택해 한 번에 변환할 수 있습니다."],
      ["품질 값은 언제 적용되나요?", "JPG와 WebP 저장 때 적용됩니다. PNG는 브라우저 특성상 품질 슬라이더의 영향이 작거나 없을 수 있습니다."],
      [
        "원본 파일이 바뀌나요?",
        "아니요. 원본 파일은 그대로 두고 변환된 새 이미지 파일을 저장합니다."
      ]
    ],
    trustNote: "이미지는 브라우저에서만 처리하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["heic-to-jpg", "image-resizer"]
  },
  {
    id: "heic-to-jpg",
    title: "HEIC JPG 변환",
    shortTitle: "HEIC JPG",
    path: "/tools/heic-jpg-converter/",
    category: "image",
    description:
      "iPhone HEIC, HEIF 사진을 브라우저에서 JPG 또는 PNG 이미지로 바꿔 저장합니다.",
    pageTitle: "HEIC JPG 변환 - 아이폰 사진 JPG 무료 변환",
    metaDescription:
      "아이폰 HEIC, HEIF 사진을 JPG 또는 PNG로 무료 변환하세요. 설치 없이 브라우저에서 처리하고 파일은 서버로 전송되지 않습니다.",
    primaryQuery: "HEIC JPG 변환",
    secondaryQueries: ["HEIC JPG", "아이폰 사진 JPG 변환", "HEIF JPG 변환", "HEIC PNG 변환"],
    userMoment: "iPhone 사진이 HEIC라서 회사, 관공서, 학교 업로드 시스템에서 열리지 않을 때",
    featureList: [
      "HEIC/HEIF 입력 지원",
      "JPG/PNG 출력 선택",
      "여러 이미지 일괄 변환",
      "JPG 품질 조절",
      "브라우저 안에서 이미지 처리"
    ],
    faqs: [
      [
        "HEIC 사진이 서버에 업로드되나요?",
        "아니요. 선택한 HEIC 파일은 브라우저에서만 읽고 변환합니다. 원본 파일과 파일명은 서버로 보내지 않습니다."
      ],
      ["iPhone 사진을 JPG로 바꿀 수 있나요?", "네. iPhone에서 촬영된 HEIC 또는 HEIF 사진을 JPG 파일로 저장할 수 있습니다."],
      ["PNG로도 저장할 수 있나요?", "네. 출력 형식을 PNG로 바꾸면 PNG 이미지로 저장합니다."],
      ["여러 장을 한 번에 바꿀 수 있나요?", "네. 최대 10장, 총 80MB까지 선택해 한 번에 변환할 수 있습니다."],
      ["처음 변환이 조금 느린 이유는 뭔가요?", "HEIC는 브라우저 기본 이미지보다 디코딩이 무거워, 처음 변환할 때 HEIC 처리 모듈을 불러옵니다."],
      [
        "원본 파일이 바뀌나요?",
        "아니요. 원본 파일은 그대로 두고 변환된 새 JPG 또는 PNG 파일을 저장합니다."
      ]
    ],
    trustNote: "HEIC 처리는 브라우저에서만 실행하며, 원본 파일과 파일명을 분석 이벤트로 보내지 않습니다.",
    relatedToolIds: ["image-converter", "image-resizer"]
  }
];

export function getTool(id: ToolId): ToolInfo {
  const tool = tools.find((item) => item.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

export function getToolCategory(id: ToolCategoryId): ToolCategory {
  const category = toolCategories.find((item) => item.id === id);
  if (!category) throw new Error(`Unknown tool category: ${id}`);
  return category;
}

export function getToolsByCategory(category: ToolCategoryId): ToolInfo[] {
  return tools.filter((tool) => tool.category === category);
}

export function getRelatedTools(tool: ToolInfo): ToolInfo[] {
  return tool.relatedToolIds.map(getTool);
}
