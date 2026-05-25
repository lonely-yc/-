import { describe, expect, it } from "vitest";
import {
  getDashboardMetrics,
  getProjectStats,
  getRelationshipGaps,
  getTraceChains,
  initialTrackerData,
} from "./changeTracker";

describe("change tracker domain", () => {
  it("calculates dashboard metrics", () => {
    const metrics = getDashboardMetrics(initialTrackerData);

    expect(metrics.projectCount).toBe(3);
    expect(metrics.changeCount).toBe(4);
    expect(metrics.deploymentCount).toBe(3);
    expect(metrics.lateChangeCount).toBe(3);
    expect(metrics.lateChangeRatio).toBe(75);
    expect(metrics.abnormalDeploymentCount).toBe(2);
  });

  it("builds trace chains across requirement, dev changes, and deployments", () => {
    const chains = getTraceChains(initialTrackerData);
    const chain = chains.find((item) => item.change.id === "CR-202605-001");

    expect(chain?.project?.name).toBe("智慧园区运营平台");
    expect(chain?.devChanges).toHaveLength(2);
    expect(chain?.deployments[0]?.id).toBe("PKG-20260510-01");
  });

  it("reports unlinked ledger gaps", () => {
    const gaps = getRelationshipGaps(initialTrackerData);

    expect(gaps.devChangesWithoutChange.map((item) => item.changeId)).toContain("CR-202605-999");
    expect(gaps.deploymentsWithoutChange).toContainEqual({
      deploymentId: "PKG-20260515-01",
      changeId: "CR-202605-404",
    });
  });

  it("computes project-level delivery stats", () => {
    const stats = getProjectStats(initialTrackerData);
    const project = stats.find((item) => item.project.id === "P-001");

    expect(project?.changeCount).toBe(2);
    expect(project?.deploymentCount).toBe(2);
    expect(project?.lateChangeRatio).toBe(50);
    expect(project?.averageLeadHours).toBeGreaterThan(0);
  });
});
