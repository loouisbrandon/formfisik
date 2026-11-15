# Estilos terceiros preservados

`src/styles/vendor/shadcn-tailwind.css` é uma cópia sem mudanças do CSS de `shadcn@4.23.0/dist/tailwind.css`, sob MIT (copyright 2023 shadcn). A licença está em `shadcn-MIT.txt`.

SHA-256 do CSS: `4c371f7a1ff5d219ae2f7ff28bd256b4346fd546fe46fbae22092e57db2f0fae`.

O CLI shadcn não é dependência da aplicação: somente o CSS era utilizado. A cópia remove a árvore executável que trazia deepmerge sem correção publicada; não é uma implementação de merge nem uma supressão de advisory. Alterações futuras do CSS devem registrar origem/licença/hash e passar por validação visual. Não reintroduzir o CLI como solução automática de atualização.
