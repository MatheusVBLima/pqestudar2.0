

# Plano: Adicionar link "Curadorias" no menu do usuário

## Resumo
Adicionar um item de menu "Curadorias" no dropdown do usuário autenticado, posicionado logo abaixo de "Salvos". Este link será visível **apenas para usuários admin**.

---

## Alterações

### Arquivo: `src/components/layout/navbar.tsx`

**1. Importar o hook e ícone necessários:**
- Importar `useUserRoles` de `@/hooks/useUserRoles`
- Importar ícone `LayoutList` (ou `Layers`) de `lucide-react` para representar curadorias

**2. Usar o hook no componente:**
```tsx
const { isAdmin } = useUserRoles();
```

**3. Desktop - Adicionar item no dropdown do usuário (após "Salvos", linha ~191):**
```tsx
<DropdownMenuItem 
  onClick={() => handleNavigation("/ferramentas/salvos")}
  className="cursor-pointer"
>
  <Bookmark className="h-4 w-4 mr-2" />
  Salvos
</DropdownMenuItem>

{/* NOVO: Link para Curadorias (apenas admin) */}
{isAdmin && (
  <DropdownMenuItem 
    onClick={() => handleNavigation("/admin/curadorias")}
    className="cursor-pointer"
  >
    <LayoutList className="h-4 w-4 mr-2" />
    Curadorias
  </DropdownMenuItem>
)}

<DropdownMenuSeparator />
```

**4. Mobile - Adicionar item no menu mobile (após "Salvos", linha ~276):**
```tsx
<DropdownMenuItem 
  onClick={() => handleNavigation("/ferramentas/salvos")}
  className="cursor-pointer"
>
  <Bookmark className="h-4 w-4 mr-2" />
  Salvos
</DropdownMenuItem>

{/* NOVO: Link para Curadorias (apenas admin) */}
{isAdmin && (
  <DropdownMenuItem 
    onClick={() => handleNavigation("/admin/curadorias")}
    className="cursor-pointer"
  >
    <LayoutList className="h-4 w-4 mr-2" />
    Curadorias
  </DropdownMenuItem>
)}

<DropdownMenuSeparator />
```

---

## Detalhes Técnicos

| Aspecto | Detalhe |
|---------|---------|
| Hook utilizado | `useUserRoles` (já existe no projeto) |
| Ícone | `LayoutList` do lucide-react |
| Rota destino | `/admin/curadorias` |
| Visibilidade | Apenas quando `isAdmin === true` |
| Posição | Logo abaixo de "Salvos", antes do separador |

---

## Arquivos Alterados
- `src/components/layout/navbar.tsx` (único arquivo)

---

## Garantias de Escopo
- Nenhuma rota será criada ou modificada
- Nenhuma página será alterada
- Nenhum componente fora do navbar será tocado
- A lógica de autenticação permanece intacta

