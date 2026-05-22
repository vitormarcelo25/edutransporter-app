export function limparCPF(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarCPF(valor: string): string {
  const digitos = limparCPF(valor).slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

export function validarCPF(valor: string): boolean {
  const digitos = limparCPF(valor);
  return digitos.length === 11;
}

export function limparTelefone(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarTelefone(valor: string): string {
  const digitos = limparTelefone(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos.length > 0 ? `(${digitos}` : '';
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
