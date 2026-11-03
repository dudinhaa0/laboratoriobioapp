# Laboratório Biológico — Câmera Nativa

Projeto React + Vite + Capacitor 7 para a atividade 12 (PPDM2).

## Instalação

```bash
npm install
npm run build
npx cap add android
```

**Atenção:** execute `npx cap add android` somente se ainda não existir uma pasta `android`.

## Permissões Android

Abra `android/app/src/main/AndroidManifest.xml`. Dentro de `<manifest>` e antes de `<application>`, adicione:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />
```

Nas versões recentes do Android, o seletor de fotos pode funcionar sem acesso amplo ao armazenamento. A permissão de câmera é solicitada quando necessária.

## Sincronizar e compilar

Na pasta principal:

```bash
npm run build
npx cap sync android
```

No Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Roteiro do vídeo

1. Abra o app no celular físico.
2. Toque em **Fotografar amostra** e permita o acesso quando o Android solicitar.
3. Tire uma foto de uma lâmina (ou objeto de demonstração) e confirme.
4. Mostre a imagem aparecendo na pré-visualização.
5. Toque novamente em **Fotografar amostra** e cancele/volte.
6. Mostre a mensagem de cancelamento e confirme que o app continua funcionando.
7. Opcionalmente, demonstre **Escolher da galeria**.

## Requisitos implementados

- Plugin oficial `@capacitor/camera`.
- `Camera.getPhoto` com `CameraResultType.DataUrl` e `CameraSource.Camera`.
- Verificação/solicitação de permissões com `Camera.checkPermissions` e `Camera.requestPermissions`.
- Estado React para renderizar a imagem no DOM.
- `try/catch/finally` para tratar cancelamento sem travar a interface.
- Botão adicional para importar imagem da galeria.

A câmera nativa precisa ser testada em um aparelho Android; o navegador do computador não oferece a mesma experiência nativa.
