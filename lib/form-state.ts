export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const idleState: FormState = { status: "idle", message: "" };

export function errorState(message: string): FormState {
  return { status: "error", message };
}

export function successState(message: string): FormState {
  return { status: "success", message };
}
