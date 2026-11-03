
import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from './services/supabase';

export default function LaboratorioBioApp() {
  const [dataUrlLamina, setDataUrlLamina] = useState(null);
  const [urlPublica, setUrlPublica] = useState(null);
  const [origemImagem, setOrigemImagem] = useState('');
  const [mensagem, setMensagem] = useState('Nenhuma imagem selecionada.');
  const [carregando, setCarregando] = useState(false);

  async function verificarPermissao(origem) {
    const atual = await Camera.checkPermissions();
    const status = origem === CameraSource.Camera
      ? atual.camera
      : atual.photos;

    if (status === 'granted' || status === 'limited') return true;

    const solicitada = origem === CameraSource.Camera
      ? await Camera.requestPermissions({ permissions: ['camera'] })
      : await Camera.requestPermissions({ permissions: ['photos'] });

    const resultado = origem === CameraSource.Camera
      ? solicitada.camera
      : solicitada.photos;

    return resultado === 'granted' || resultado === 'limited';
  }

  async function enviarParaSupabase(dataUrl) {
    setMensagem('Preparando imagem para envio à nuvem...');

    // Converte a imagem Base64/Data URL em Blob
    const resposta = await fetch(dataUrl);
    const arquivo = await resposta.blob();

    const extensao = arquivo.type.split('/')[1] || 'jpg';
    const nomeArquivo = `lamina-${Date.now()}.${extensao}`;

    setMensagem('Enviando imagem para o Supabase Storage...');

    const { data, error } = await supabase.storage
      .from('fotos-camera')
      .upload(nomeArquivo, arquivo, {
        contentType: arquivo.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Recupera a URL pública da imagem enviada
    const { data: urlData } = supabase.storage
      .from('fotos-camera')
      .getPublicUrl(data.path);

    setUrlPublica(urlData.publicUrl);
    setMensagem('Imagem enviada e armazenada com sucesso na nuvem!');

    return urlData.publicUrl;
  }

  async function abrirImagem(origem) {
    try {
      setCarregando(true);
      setMensagem('Verificando permissões...');

      const permitido = await verificarPermissao(origem);

      if (!permitido) {
        setMensagem('Permissão não concedida. Verifique as configurações do aplicativo.');
        return;
      }

      setMensagem(
        origem === CameraSource.Camera
          ? 'Abrindo a câmera...'
          : 'Abrindo a galeria...'
      );

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
      setUrlPublica(null);

      setOrigemImagem(
        origem === CameraSource.Camera
          ? 'Foto capturada pela câmera'
          : 'Imagem selecionada da galeria'
      );

      setMensagem('Imagem carregada! Preparando envio...');

      await enviarParaSupabase(imagem.dataUrl);

    } catch (erro) {
      console.error('Erro na captura ou no envio:', erro);

      if (erro?.message?.toLowerCase().includes('cancel')) {
        setMensagem('Ação cancelada. O aplicativo continua funcionando.');
      } else {
        setMensagem(
          `Não foi possível enviar a imagem: ${erro.message || 'Erro desconhecido'}.`
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">LB</div>
        <div>
          <p className="eyebrow">AMBIENTE DE PESQUISA</p>
          <h1>Laboratório Biológico</h1>
        </div>
      </header>

      <section className="intro">
        <span className="tag">REGISTRO DE AMOSTRAS</span>
        <h2>Digitalização de lâminas</h2>
        <p>
          Registre imagens das lâminas de microscópio para visualizar
          e utilizar nos relatórios de análise.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CAPTURA DE IMAGEM</p>
            <h3>Análise de lâminas</h3>
          </div>
          <span className="microscope-icon">⌕</span>
        </div>

        <div className="actions">
          <button
            className="button primary"
            onClick={() => abrirImagem(CameraSource.Camera)}
            disabled={carregando}
          >
            ◎ {carregando ? 'Aguarde...' : 'Fotografar amostra'}
          </button>

          <button
            className="button secondary"
            onClick={() => abrirImagem(CameraSource.Photos)}
            disabled={carregando}
          >
            ▧ Escolher da galeria
          </button>
        </div>

        <p className="status" role="status" aria-live="polite">
          {mensagem}
        </p>

        <div className="preview">
          {dataUrlLamina ? (
            <>
              <img
                src={dataUrlLamina}
                alt="Imagem da lâmina para análise"
              />

              <div className="image-caption">
                <span className="status-dot" />
                <div>
                  <strong>{origemImagem}</strong>
                  <small>Pré-visualização no aplicativo</small>
                </div>
              </div>

              {urlPublica && (
                <div className="image-caption">
                  <span className="status-dot" />
                  <div>
                    <strong>Imagem salva na nuvem</strong>
                    <small>
                      <a
                        href={urlPublica}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir imagem pública
                      </a>
                    </small>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-preview">
              <div className="empty-icon">▧</div>
              <strong>Nenhuma lâmina registrada</strong>
              <span>
                A imagem capturada ou escolhida aparecerá aqui.
              </span>
            </div>
          )}
        </div>
      </section>

      <footer>
        <span>LABORATÓRIO BIOLÓGICO</span>
        <span>Registro digital de amostras</span>
      </footer>
    </main>
  );
}
