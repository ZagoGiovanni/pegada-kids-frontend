export function validarCpf(valor: string) {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (quantidade: number) => {
    let soma = 0;
    for (let indice = 0; indice < quantidade; indice += 1) {
      soma += Number(cpf[indice]) * (quantidade + 1 - indice);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(cpf[9]) && calcularDigito(10) === Number(cpf[10]);
}
