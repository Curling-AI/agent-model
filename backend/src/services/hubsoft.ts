async function authService(): Promise<string> {
	const url = `${process.env.HUBSOFT_API_URL}/oauth/token`;
	const body = {
		grant_type: 'password',
		client_id: process.env.HUBSOFT_CLIENT_ID,
		client_secret: process.env.HUBSOFT_CLIENT_SECRET,
		username: process.env.HUBSOFT_USER,
		password: process.env.HUBSOFT_PASSWORD
	};
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error('Erro ao autenticar na Hubsoft');
	const data = await res.json();
	return data.access_token;
}

async function getCustomer(cpfCnpj: string) {
  const accessToken = await authService();

	const url = `${process.env.HUBSOFT_API_URL}integracao/cliente?busca=cpf_cnpj&termo_busca=${cpfCnpj}&incluir_contrato=sim`;
	const res = await fetch(url, {
		method: 'GET',
		headers: { 'Authorization': `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error('Erro ao buscar cliente');
	return await res.json();
}

async function getInvoiceLink(cpfCnpj: string) {
	const accessToken = await authService();
  
  const url = `${process.env.HUBSOFT_API_URL}/integracao/cliente/financeiro?busca=cpf_cnpj&termo_busca=${cpfCnpj}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: { 'Authorization': `Bearer ${accessToken}` }
	});
	if (!res.ok) throw new Error('Erro ao buscar link da fatura');
	return await res.json();
}

async function activateServices(serviceId: string) {
	const accessToken = await authService();
  
  const url = `${process.env.HUBSOFT_API_URL}/integracao/cliente/cliente_servico/habilitar/${serviceId}`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify({
      motivo_habilitacao: "Ativação via API"
    })
	});
	if (!res.ok) throw new Error('Erro ao ativar serviço');
	return await res.json();
}

export { authService, getCustomer, getInvoiceLink, activateServices };
