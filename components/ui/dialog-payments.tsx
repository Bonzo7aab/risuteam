import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { Button, Input, Label } from "./index";

interface PaymentDraft {
  id: string;
  installment: number;
  amount: number;
  due: string;
}

interface DialogPaymentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PaymentDraft[];
  onChange: (items: PaymentDraft[]) => void;
  disabled?: boolean;
}

export function DialogPayments({
  open,
  onOpenChange,
  items,
  onChange,
  disabled,
}: DialogPaymentsProps) {
  const [localItems, setLocalItems] = useState<PaymentDraft[]>([]);
  const [newPayment, setNewPayment] = useState<Partial<PaymentDraft>>({});

  useEffect(() => {
    if (open) {
      setLocalItems([...items]);
      setNewPayment({});
    }
  }, [open, items]);

  const handleAdd = () => {
    if (
      newPayment.installment &&
      newPayment.amount &&
      newPayment.due &&
      String(newPayment.due).trim() !== ""
    ) {
      const newItems = [
        ...localItems,
        {
          id: String(Date.now()),
          installment: newPayment.installment,
          amount: newPayment.amount,
          due: newPayment.due,
        },
      ];
      setLocalItems(newItems);
      setNewPayment({});
    }
  };

  const handleRemove = (id: string) => {
    setLocalItems(localItems.filter((item) => item.id !== id));
  };

  const handleChangeField = (
    id: string,
    field: keyof PaymentDraft,
    value: any
  ) => {
    setLocalItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pt-12">
        <DialogTitle className="text-white">Płatności</DialogTitle>
        <div className="mb-2 flex gap-2 items-center">
          <div className="flex flex-col gap-2">
            <Label htmlFor="installment" className="text-sm text-gray-500">
              Numer raty
            </Label>
            <Input
              type="number"
              value={newPayment.installment ?? ""}
              onChange={(e) =>
                setNewPayment((p) => ({
                  ...p,
                  installment: Number(e.target.value),
                }))
              }
              placeholder="Nr raty"
              disabled={disabled}
              min={1}
              style={{ width: 80 }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-sm text-gray-500">
              Kwota
            </Label>
            <Input
              type="number"
              value={newPayment.amount ?? ""}
              onChange={(e) =>
                setNewPayment((p) => ({ ...p, amount: Number(e.target.value) }))
              }
              placeholder="Kwota"
              disabled={disabled}
              min={0}
              style={{ width: 100 }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="due" className="text-sm text-gray-500">
              Termin płatności
            </Label>
            <Input
              value={newPayment.due ?? ""}
              onChange={(e) =>
                setNewPayment((p) => ({ ...p, due: e.target.value }))
              }
              placeholder="Termin płatności"
              disabled={disabled}
              style={{ flex: 1 }}
            />
          </div>
          <Button
            type="button"
            className="self-end "
            onClick={handleAdd}
            disabled={disabled}
          >
            Dodaj
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {localItems.length > 0 ? (
            localItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex gap-2 items-center pb-2 w-full"
              >
                <Input
                  type="number"
                  value={item.installment}
                  onChange={(e) =>
                    handleChangeField(
                      item.id,
                      "installment",
                      Number(e.target.value)
                    )
                  }
                  min={1}
                  style={{ width: 80 }}
                  disabled={disabled}
                />

                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handleChangeField(item.id, "amount", Number(e.target.value))
                  }
                  min={0}
                  style={{ width: 100 }}
                  disabled={disabled}
                />

                <Input
                  value={item.due}
                  onChange={(e) =>
                    handleChangeField(item.id, "due", e.target.value)
                  }
                  style={{ flex: 1 }}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemove(item.id)}
                  disabled={disabled}
                >
                  Usuń
                </Button>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Brak płatności</div>
          )}
        </div>
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
