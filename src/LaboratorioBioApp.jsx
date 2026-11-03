import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function LaboratorioBioApp() {
  const [dataUrlLamina, setDataUrlLamina] = useState(null);
  const [origemImagem, setOrigemImagem] = useState('');
  const [mensagem, setMensagem] = useState('Nenhuma imagem selecionada.');
  const [carregando, setCarregando] = useState(false);

  async function verificarPermissao(origem) {
    const atual = await Camera.checkPermissions();
    const status = origem === CameraSource.Camera ? atual.camera : atual.photos;
    if (status === 'granted' || status === 'limited') return true;
    const solicitada = origem === CameraSource.Camera
      ? await Camera.requestPermissions({ permissions: ['camera'] })
      : await Camera.requestPermissions({ permissions: ['photos'] });
    const resultado = origem === CameraSource.Camera ? solicitada.camera : solicitada.photos;
    return resultado === 'granted' || resultado === 'limited';
  }

  async function abrirImagem(origem) {
    try {
      setCarregando(true);
      setMensagem('Verificando permissões...');
      const permitido = await verificarPermissao(origem);
      if (!permitido) {
        setMensagem('Permissão não concedida. Verifique as permissões do aplicativo nas configurações do Android.');
        return;
      }
      setMensagem(origem === CameraSource.Camera ? 'Abrindo a câmera...' : 'Abrindo a galeria...');
      const imagem = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: origem
      });
      if (!imagem.dataUrl) {
        setMensagem('Não foi possível carregar a imagem. Tente novamente.');
        return;
      }
      setDataUrlLamina(imagem.dataUrl);
      setOrigemImagem(origem === CameraSource.Camera ? 'Foto capturada pela câmera' : 'Imagem selecionada da galeria');
      setMensagem('Imagem carregada com sucesso e pronta para análise.');
    } catch (erro) {
      console.info('Captura/seleção cancelada ou indisponível:', erro);
      setMensagem('Ação cancelada ou não concluída. O aplicativo continua funcionando.');
    } finally {
      setCarregando(false);
    }
  }

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark">LB</div><div><p className="eyebrow">AMBIENTE DE PESQUISA</p><h1>Laboratório Biológico</h1></div></header>
    <section className="intro"><span className="tag">REGISTRO DE AMOSTRAS</span><h2>Digitalização de lâminas</h2><p>Registre imagens das lâminas de microscópio para visualizar e utilizar nos relatórios de análise.</p></section>
    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">CAPTURA DE IMAGEM</p><h3>Análise de lâminas</h3></div><span className="microscope-icon">⌕</span></div>
      <div className="actions">
        <button className="button primary" onClick={() => abrirImagem(CameraSource.Camera)} disabled={carregando}>◎ {carregando ? 'Aguarde...' : 'Fotografar amostra'}</button>
        <button className="button secondary" onClick={() => abrirImagem(CameraSource.Photos)} disabled={carregando}>▧ Escolher da galeria</button>
      </div>
      <p className="status" role="status" aria-live="polite">{mensagem}</p>
      <div className="preview">{dataUrlLamina ? <><img src={dataUrlLamina} alt="Imagem da lâmina para análise"/><div className="image-caption"><span className="status-dot"/><div><strong>{origemImagem}</strong><small>Pré-visualização carregada no aplicativo</small></div></div></> : <div className="empty-preview"><div className="empty-icon">▧</div><strong>Nenhuma lâmina registrada</strong><span>A imagem capturada ou escolhida aparecerá aqui.</span></div>}</div>
    </section>
    <footer><span>LABORATÓRIO BIOLÓGICO</span><span>Registro digital de amostras</span></footer>
  </main>;
}
