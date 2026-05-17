export function getKoreanSignUpErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered")) {
    return "이미 가입된 이메일입니다. 다른 이메일로 시도해 주세요.";
  }

  if (normalized.includes("password should be at least")) {
    return "비밀번호는 최소 6자 이상이어야 합니다.";
  }

  if (normalized.includes("password is too weak")) {
    return "비밀번호가 너무 약합니다. 더 강한 비밀번호를 입력해 주세요.";
  }

  if (normalized.includes("invalid email")) {
    return "올바른 이메일 형식을 입력해 주세요.";
  }

  if (normalized.includes("signup is disabled")) {
    return "현재 회원가입을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  return "회원가입에 실패했습니다. 입력한 정보를 다시 확인해 주세요.";
}
