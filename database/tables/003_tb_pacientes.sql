-- A tabela já é usada pelo cadastro (/auth/cadastro); o script só cria se ainda não existir.
IF OBJECT_ID('dbo.TB_PACIENTES', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TB_PACIENTES (
        PK_ID                   INT IDENTITY(1,1) NOT NULL,
        DS_NOME                 VARCHAR(255)      NOT NULL,
        NR_CPF                  VARCHAR(14)       NULL,
        NR_CARTAO_SUS           VARCHAR(30)       NULL,
        DT_NASCIMENTO           SMALLDATETIME     NULL,
        TP_SEXO                 VARCHAR(1)        NULL,
        DS_TELEFONE             VARCHAR(20)       NULL,
        DS_EMAIL                VARCHAR(100)      NULL,
        DS_ENDERECO             VARCHAR(255)      NULL,
        DS_TIPO_SANGUINEO       VARCHAR(5)        NULL,
        DS_ALERGIAS             VARCHAR(500)      NULL,
        DS_CONTATO_EMERGENCIA   VARCHAR(255)      NULL,
        TP_STATUS               VARCHAR(10)       NOT NULL CONSTRAINT DF_TB_PACIENTES_TP_STATUS DEFAULT 'ativo',
        CONSTRAINT PK_TB_PACIENTES PRIMARY KEY CLUSTERED (PK_ID),
        CONSTRAINT CK_TB_PACIENTES_TP_STATUS CHECK (TP_STATUS IN ('ativo', 'inativo'))
    )
END
GO
