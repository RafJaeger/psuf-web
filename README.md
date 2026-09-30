# PSUF Web

Versao web do PSUF para usar pelo navegador, pensada principalmente para quem esta no iPhone e nao consegue usar o app Android.

O site usa o banco publico do PSUF, permite pesquisar jogos, ver patches de FPS e graficos, aplicar codigos em jogo aberto pelo webMAN/PS3MAPI e atualizar o banco online pelo GitHub.

## O que tem

- Modo manual para aplicar codigos em jogo aberto.
- Lista de jogos do banco PSUF.
- Patches de FPS separados dos patches graficos.
- Opcao de salvar o patch no PS3 para tentar reaplicar ao abrir o jogo.
- Atualizacao online do banco direto do GitHub.
- Importacao de banco `.psufdb`.
- Overclock via webMAN, com limite PSUF de GPU 750 MHz e VRAM 850 MHz.
- Interface em PT-BR, English e ES.

## Limitacao no iPhone

O site fica em HTTPS, mas o PS3 normalmente responde em HTTP dentro da rede local. Alguns navegadores podem bloquear comandos para `http://IP_DO_PS3` por seguranca. Quando isso acontecer, o site mostra os comandos gerados para o usuario abrir pelo navegador.

## Banco online

O botao de atualizar online busca os arquivos em:

`https://raw.githubusercontent.com/RafJaeger/psuf-ps3/main/release/USRDIR/`

Arquivos usados:

- `patches.csv`
- `graphics_patches.csv`
- `native60.csv`
- `fix_patches.csv`

## Publicacao

Esse repositorio e separado do codigo do PSUF PS3.
