export type ToolId =
  | "business-nameplate"
  | "transaction-statement"
  | "estimate"
  | "receipt"
  | "invoice"
  | "vat-calculator";

export type ToolCategoryId = "business" | "pdf";

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
      "거래명세서, 견적서, 청구서, 영수증, 부가세 계산처럼 제출 직전에 필요한 한국형 업무 문서를 브라우저에서 작성합니다.",
    status: "active"
  },
  {
    id: "pdf",
    title: "PDF 도구",
    shortTitle: "PDF",
    path: "/categories/pdf/",
    description:
      "PDF 합치기, 나누기, 압축 같은 파일 도구를 한국 업무 문서 흐름에 맞춰 준비 중입니다.",
    status: "planned"
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
    pageTitle: "사업자 명판 만들기 무료 - 회사 정보 이미지 생성",
    metaDescription:
      "사업자명, 대표자, 사업자등록번호, 주소를 입력해 문서에 넣을 수 있는 사업자 명판 이미지를 무료로 만드세요.",
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
    relatedToolIds: ["transaction-statement", "estimate"]
  },
  {
    id: "transaction-statement",
    title: "거래명세서 자동작성",
    shortTitle: "거래명세서",
    path: "/tools/transaction-statement-generator/",
    category: "business",
    description:
      "공급자, 거래처, 품목, 수량, 단가를 입력해 거래명세서를 바로 작성하고 인쇄합니다.",
    pageTitle: "거래명세서 자동작성 - 무료 거래명세서 양식",
    metaDescription:
      "공급자, 거래처, 품목, 수량, 단가를 입력해 거래명세서를 바로 작성하세요. 무료 양식과 인쇄를 지원합니다.",
    primaryQuery: "거래명세서 자동작성",
    secondaryQueries: ["거래명세서 양식 무료", "거래명세표 양식", "거래명세서 PDF"],
    userMoment: "거래 내역을 거래처에 바로 보내거나 PDF로 저장해야 하는 순간",
    featureList: [
      "거래명세서 품목 행 추가",
      "부가세 포함/별도/없음 계산",
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
    relatedToolIds: ["vat-calculator", "invoice"]
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
    relatedToolIds: ["vat-calculator", "receipt"]
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
    relatedToolIds: ["estimate", "invoice"]
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
