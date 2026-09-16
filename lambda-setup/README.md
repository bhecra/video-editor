# Remotion Lambda — pendiente por permisos IAM

`aws iam create-policy` falló con el rol `TechLeadDev` (`AccessDenied`). Falta que
alguien con permisos de IAM en la cuenta `824404647578` corra esto una vez.
Los nombres usan el prefijo `poc-video-editor-` para dejar claro que es un experimento.

## 1. Crear la política y el rol de ejecución de Lambda

```bash
aws iam create-policy \
  --policy-name poc-video-editor-remotion-lambda-policy \
  --policy-document file://remotion-lambda-role-policy.json

aws iam create-role \
  --role-name poc-video-editor-remotion-lambda-role \
  --assume-role-policy-document file://lambda-trust-policy.json

aws iam attach-role-policy \
  --role-name poc-video-editor-remotion-lambda-role \
  --policy-arn arn:aws:iam::824404647578:policy/poc-video-editor-remotion-lambda-policy
```

## 2. Crear el usuario que dispara los renders + su access key

```bash
aws iam create-user --user-name poc-video-editor-remotion-user

aws iam put-user-policy \
  --user-name poc-video-editor-remotion-user \
  --policy-name poc-video-editor-remotion-user-policy \
  --policy-document file://remotion-user-policy.json

aws iam create-access-key --user-name poc-video-editor-remotion-user
```

Copia el `AccessKeyId` y `SecretAccessKey` que imprime el último comando a un
`.env` en la raíz del proyecto (este archivo **no** se commitea):

```
REMOTION_AWS_ACCESS_KEY_ID=<AccessKeyId>
REMOTION_AWS_SECRET_ACCESS_KEY=<SecretAccessKey>
```

## 3. Validar, desplegar función + sitio, y probar

Desde la raíz del proyecto (`video-render/`):

```bash
npx remotion lambda policies validate

npx remotion lambda functions deploy \
  --custom-role-arn=arn:aws:iam::824404647578:role/poc-video-editor-remotion-lambda-role

npx remotion lambda sites create src/index.ts --site-name=poc-video-editor

npx remotion lambda quotas

npx remotion lambda render <serve-url-del-paso-anterior> SceneEditor
```

## 4. Avísame cuando esté listo

Con eso desplegado, cambio `render-server/server.ts` para que en vez de
renderizar localmente (SSR con `@remotion/renderer`), dispare el render con
`renderMediaOnLambda()` + `getRenderProgress()` — la interfaz del editor
(`editor-demo`) no cambia, solo el backend del botón "Generar video".
