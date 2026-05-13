const { UserService } = require('../src/userService');

describe('UserService - Suíte de Testes Refatorada (Clean)', () => {
	let userService;

	beforeEach(() => {
		userService = new UserService();
		userService._clearDB();
	});

	describe('createUser', () => {
		test('deve criar um usuário com dados válidos', () => {
			// Arrange
			const nome = 'Fulano de Tal';
			const email = 'fulano@teste.com';
			const idade = 25;

			// Act
			const usuarioCriado = userService.createUser(nome, email, idade);

			// Assert
			expect(usuarioCriado).toBeDefined();
			expect(usuarioCriado.id).toBeDefined();
			expect(usuarioCriado.nome).toBe(nome);
			expect(usuarioCriado.email).toBe(email);
			expect(usuarioCriado.idade).toBe(idade);
			expect(usuarioCriado.status).toBe('ativo');
			expect(usuarioCriado.isAdmin).toBe(false);
			expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
		});

		test('deve lançar erro ao criar usuário sem nome', () => {
			// Arrange
			const email = 'teste@teste.com';
			const idade = 25;

			// Act & Assert
			expect(() => {
				userService.createUser(null, email, idade);
			}).toThrow('Nome, email e idade são obrigatórios.');
		});

		test('deve lançar erro ao criar usuário sem email', () => {
			// Arrange
			const nome = 'Fulano';
			const idade = 25;

			// Act & Assert
			expect(() => {
				userService.createUser(nome, null, idade);
			}).toThrow('Nome, email e idade são obrigatórios.');
		});

		test('deve lançar erro ao criar usuário sem idade', () => {
			// Arrange
			const nome = 'Fulano';
			const email = 'teste@teste.com';

			// Act & Assert
			expect(() => {
				userService.createUser(nome, email, null);
			}).toThrow('Nome, email e idade são obrigatórios.');
		});

		test('deve lançar erro ao criar usuário menor de idade', () => {
			// Arrange
			const nome = 'Menor';
			const email = 'menor@email.com';
			const idade = 17;

			// Act & Assert
			expect(() => {
				userService.createUser(nome, email, idade);
			}).toThrow('O usuário deve ser maior de idade.');
		});

		test('deve criar usuário com flag isAdmin quando especificado', () => {
			// Arrange
			const nome = 'Admin';
			const email = 'admin@teste.com';
			const idade = 30;
			const isAdmin = true;

			// Act
			const usuarioCriado = userService.createUser(nome, email, idade, isAdmin);

			// Assert
			expect(usuarioCriado.isAdmin).toBe(true);
		});
	});

	describe('getUserById', () => {
		test('deve buscar um usuário existente pelo ID', () => {
			// Arrange
			const usuarioCriado = userService.createUser('Fulano', 'fulano@teste.com', 25);

			// Act
			const usuarioBuscado = userService.getUserById(usuarioCriado.id);

			// Assert
			expect(usuarioBuscado).toBeDefined();
			expect(usuarioBuscado.id).toBe(usuarioCriado.id);
			expect(usuarioBuscado.nome).toBe('Fulano');
			expect(usuarioBuscado.email).toBe('fulano@teste.com');
		});

		test('deve retornar null ao buscar usuário inexistente', () => {
			// Arrange
			const idInexistente = 'id-que-nao-existe';

			// Act
			const resultado = userService.getUserById(idInexistente);

			// Assert
			expect(resultado).toBeNull();
		});
	});

	describe('deactivateUser', () => {
		test('deve desativar um usuário comum com sucesso', () => {
			// Arrange
			const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30, false);

			// Act
			const resultado = userService.deactivateUser(usuarioComum.id);

			// Assert
			expect(resultado).toBe(true);
			const usuarioAtualizado = userService.getUserById(usuarioComum.id);
			expect(usuarioAtualizado.status).toBe('inativo');
		});

		test('deve impedir desativação de usuário administrador', () => {
			// Arrange
			const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

			// Act
			const resultado = userService.deactivateUser(usuarioAdmin.id);

			// Assert
			expect(resultado).toBe(false);
			const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
			expect(usuarioAtualizado.status).toBe('ativo');
		});

		test('deve retornar false ao tentar desativar usuário inexistente', () => {
			// Arrange
			const idInexistente = 'id-que-nao-existe';

			// Act
			const resultado = userService.deactivateUser(idInexistente);

			// Assert
			expect(resultado).toBe(false);
		});
	});

	describe('generateUserReport', () => {
		test('deve gerar relatório contendo informações dos usuários cadastrados', () => {
			// Arrange
			userService.createUser('Alice', 'alice@email.com', 28);
			userService.createUser('Bob', 'bob@email.com', 32);

			// Act
			const relatorio = userService.generateUserReport();

			// Assert
			expect(relatorio).toContain('Alice');
			expect(relatorio).toContain('Bob');
			expect(relatorio).toContain('ativo');
		});

		test('deve gerar relatório com cabeçalho apropriado', () => {
			// Arrange
			userService.createUser('Alice', 'alice@email.com', 28);

			// Act
			const relatorio = userService.generateUserReport();

			// Assert
			expect(relatorio).toContain('Relatório de Usuários');
		});

		test('deve gerar relatório indicando ausência de usuários quando banco vazio', () => {
			// Arrange - banco já está vazio devido ao beforeEach

			// Act
			const relatorio = userService.generateUserReport();

			// Assert
			expect(relatorio).toContain('Nenhum usuário cadastrado');
		});

		test('deve incluir status do usuário no relatório', () => {
			// Arrange
			const usuario = userService.createUser('Charlie', 'charlie@email.com', 25);
			userService.deactivateUser(usuario.id);

			// Act
			const relatorio = userService.generateUserReport();

			// Assert
			expect(relatorio).toContain('Charlie');
			expect(relatorio).toContain('inativo');
		});
	});
});
