import { useState, useEffect } from "react";
import { Button, Input, Label } from "./index";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import {
  SortableList,
  SortableListItem,
  Item as SortableItem,
} from "./sortable-list";

interface DialogNotIncludedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SortableItem[];
  onChange: (items: SortableItem[]) => void;
  disabled?: boolean;
}

export function DialogNotIncluded({
  open,
  onOpenChange,
  items,
  onChange,
  disabled,
}: DialogNotIncludedProps) {
  const [localItems, setLocalItems] = useState<SortableItem[]>([]);
  const [newNotIncludedText, setNewNotIncludedText] = useState("");

  useEffect(() => {
    if (open) {
      setLocalItems([...items]);
      setNewNotIncludedText("");
    }
  }, [open, items]);

  const handleAdd = () => {
    if (newNotIncludedText.trim()) {
      const newItems = [
        ...localItems,
        {
          id: String(Date.now()),
          text: newNotIncludedText.trim(),
          checked: false,
          description: "",
        },
      ];
      setLocalItems(newItems);
      setNewNotIncludedText("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pt-12">
        <div className="mb-2 flex gap-2">
          <Input
            value={newNotIncludedText}
            onChange={(e) => setNewNotIncludedText(e.target.value)}
            placeholder="Dodaj pozycję nie zawiera"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd();
                e.preventDefault();
              }
            }}
            disabled={disabled}
          />
          <Button type="button" onClick={handleAdd} disabled={disabled}>
            Dodaj
          </Button>
        </div>
        <Label className="text-gray-500">Oferta nie zawiera</Label>
        <SortableList
          items={localItems}
          setItems={(newItems) => {
            setLocalItems(newItems);
          }}
          onCompleteItem={(id) => {
            const newItems = localItems.filter((item) => item.id !== id);
            setLocalItems(newItems);
          }}
          renderItem={(item, order, onCompleteItem, onRemoveItem) => (
            <SortableListItem
              key={item.id}
              item={item}
              order={order}
              onCompleteItem={() => {
                const newItems = localItems.filter((i) => i.id !== item.id);
                setLocalItems(newItems);
              }}
              onRemoveItem={() => {
                const newItems = localItems.filter((i) => i.id !== item.id);
                setLocalItems(newItems);
              }}
              handleDrag={() => {}}
            />
          )}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="default"
            onClick={() => {
              onChange(localItems);
              onOpenChange(false);
            }}
            disabled={disabled}
          >
            Zatwierdź
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Anuluj
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
