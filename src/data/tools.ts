export type ToolId = "business-nameplate" | "transaction-statement" | "estimate";

export type ToolInfo = {
  id: ToolId;
  title: string;
  shortTitle: string;
  path: string;
  description: string;
  primaryQuery: string;
  secondaryQueries: string[];
  trustNote: string;
};

export const tools: ToolInfo[] = [
  {
    id: "business-nameplate",
    title: "사업자 명판 만들기 무료",
    shortTitle: "명판",
    path: "/tools/business-nameplate-maker",
    description:
      "상호, 대표자, 사업자등록번호, 주소를 입력해 문서에 넣을 수 있는 사업자 명판 이미지를 만듭니다.",
    primaryQuery: "사업자 명판 만들기 무료",
    secondaryQueries: ["사업자 명판 이미지", "전자 사업자 명판", "명판 도장 합성 이미지"],
    trustNote: "문서 삽입용 이미지 생성 도구이며, 법적 효력이나 인감 증명을 대신하지 않습니다."
  },
  {
    id: "transaction-statement",
    title: "거래명세서 자동작성",
    shortTitle: "거래명세서",
    path: "/tools/transaction-statement-generator",
    description:
      "공급자, 거래처, 품목, 수량, 단가를 입력해 거래명세서를 바로 작성하고 인쇄합니다.",
    primaryQuery: "거래명세서 자동작성",
    secondaryQueries: ["거래명세서 양식 무료", "거래명세표 양식", "거래명세서 PDF"],
    trustNote: "일반 거래 내역 정리용 양식입니다. 세금계산서나 전자세금계산서 발행을 대신하지 않습니다."
  },
  {
    id: "estimate",
    title: "견적서 자동작성",
    shortTitle: "견적서",
    path: "/tools/estimate-generator",
    description:
      "고객명, 품목, 수량, 단가를 입력해 견적서를 무료로 작성하고 인쇄합니다.",
    primaryQuery: "견적서 자동작성",
    secondaryQueries: ["견적서 양식 무료", "무료 견적서 양식", "견적서 PDF"],
    trustNote: "견적 전달용 문서 생성 도구입니다. 계약 체결이나 세금계산서 발행을 대신하지 않습니다."
  }
];

export function getTool(id: ToolId): ToolInfo {
  const tool = tools.find((item) => item.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}
