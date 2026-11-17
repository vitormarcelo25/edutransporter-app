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

/** Valida CPF com checagem completa dos 2 dígitos verificadores e rejeição de repetidos. */
export function validarCPFReal(valor: string): boolean {
  const d = limparCPF(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(d[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(d[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(d[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(d[10]);
}

export function limparTelefone(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarTelefone(valor: string): string {
  const digitos = limparTelefone(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos.length > 0 ? `(${digitos}` : '';
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function validarTelefoneBR(valor: string): boolean {
  const d = limparTelefone(valor);
  if (d.length !== 10 && d.length !== 11) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== '9') return false;
  if (/^(\d)\1+$/.test(d.slice(2))) return false;
  return true;
}

export function limparCNH(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function formatarCNH(valor: string): string {
  return limparCNH(valor);
}

export function validarCNH(valor: string): boolean {
  const d = valor.replace(/\D/g, '');
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  return true;
}

export function limparPlaca(valor: string): string {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

export function formatarPlaca(valor: string): string {
  const raw = limparPlaca(valor);
  if (raw.length <= 3) return raw;
  // Padrão antigo (AAA-0000): se o 5º caractere ainda não é letra Mercosul
  if (/^[A-Z]{3}\d{1,4}$/.test(raw)) {
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }
  return raw;
}

export function validarPlaca(valor: string): boolean {
  const raw = limparPlaca(valor);
  return /^[A-Z]{3}\d{4}$/.test(raw) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(raw);
}
