# UTM Link Reference — Trilha do Lucro

Use estes links ao divulgar o site no Instagram. Os parâmetros UTM são capturados
automaticamente e repassados ao link de checkout do Hotmart, permitindo rastrear
qual post/story originou cada venda no GA4.

---

## Bio do Instagram

```
https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=bio&utm_campaign=semana1
```

---

## Stories

| Dia       | Link |
|-----------|------|
| Segunda   | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_seg` |
| Terça     | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_ter` |
| Quarta    | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_qua` |
| Quinta    | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_qui` |
| Sexta     | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_sex` |
| Sábado    | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_sab` |
| Domingo   | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=story&utm_campaign=semana1_dom` |

---

## Posts do Feed

| Post  | Link |
|-------|------|
| Post 1 | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=post&utm_campaign=semana1_post1` |
| Post 2 | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=post&utm_campaign=semana1_post2` |
| Post 3 | `https://www.trilhadolucro.com.br?utm_source=instagram&utm_medium=post&utm_campaign=semana1_post3` |

---

## Como usar no GA4

No painel do GA4, acesse **Relatórios > Aquisição > Aquisição de tráfego** e filtre
por `utm_source = instagram`. O parâmetro `utm_campaign` indica o post/story exato.

Para ver as conversões, acesse **Relatórios > Engajamento > Eventos** e filtre pelos eventos:
- `cta_click` — cliques nos botões de diagnóstico e checkout
- `begin_checkout` — cliques no botão de compra do Hotmart

Para semanas seguintes, troque `semana1` por `semana2`, `semana3`, etc.
