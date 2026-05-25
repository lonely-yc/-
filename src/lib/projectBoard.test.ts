import { describe, expect, it } from "vitest";
import { buildProjectBoard, buildProjectOperationLogs, getProjectRisk } from "./projectBoard";

describe("project board metrics", () => {
  it("sorts projects by change and delivery activity", () => {
    const board = buildProjectBoard(
      [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ],
      {
        1: { changes: [{ id: 1 }, { id: 2 }], deliveries: [{ id: 1 }], middlewares: [] },
        2: { changes: [], deliveries: [{ id: 1 }], middlewares: [{ id: 1 }] },
      },
    );

    expect(board.map((item) => item.name)).toEqual(["A", "B"]);
    expect(board[0]).toMatchObject({ changeCount: 2, deliveryCount: 1, riskLevel: "高" });
  });

  it("marks projects with repeated deliveries as medium risk", () => {
    expect(getProjectRisk({ changes: [], deliveries: [{ id: 1 }, { id: 2 }], middlewares: [{ id: 1 }] })).toEqual({
      riskLevel: "中",
      riskReason: "发包频率偏高，建议关注现场验证结果",
    });
  });

  it("builds recent operation logs newest first", () => {
    const logs = buildProjectOperationLogs(
      [{ id: 1, name: "停电智能体" }],
      {
        1: {
          changes: [],
          deliveries: [],
          middlewares: [],
          timeline: [
            { date: "2026-05-21", title: "启动", actor: "李楠", type: "milestone" },
            { date: "2026-05-30", title: "发包", actor: "陈越", type: "delivery" },
          ],
        },
      },
    );

    expect(logs[0]).toMatchObject({ projectName: "停电智能体", title: "发包" });
  });
});
