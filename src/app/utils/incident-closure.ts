/** Workflow status is authoritative; missing workflow state fails closed. */
export function canCloseIncident(incident: any): boolean {
  return typeof incident?.workflow?.status === "string"
    && incident.workflow.status.toLowerCase() === "resolved";
}
