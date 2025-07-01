import { Button } from "@mui/material";

type Props = {
  onImage: (file: File) => void;
  sx?: any;
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
}

export default function ClipboardImageButton({
  onImage,
  sx,
  variant = "outlined",
  size = "small"
}: Props) {
  const handleClick = async () => {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      alert("このブラウザはクリップボード画像の貼り付けに対応していません");
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "clipboard-image", { type: blob.type });
            onImage(file);
            return;
          }
        }
      }
      alert("クリップボードに画像がありません");
    } catch (err) {
      alert("クリップボードから画像の取得に失敗しました");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      sx={sx}
      onClick={handleClick}
    >
      クリップボードから画像を貼り付け
    </Button>
  );
}
