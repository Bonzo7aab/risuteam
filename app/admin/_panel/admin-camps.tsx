"use client";
import { Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Import types and functions from the new data file
import {
  deleteCamp,
  fetchPlaces,
  fetchTrainers,
  insertCamp,
  updateCamp,
  deleteCampTrainers,
  insertCampTrainers,
  fetchCamps,
} from "@/app/actions";
import { Camp, PlaceType, CampPayment } from "@/app/types/types";
import { Button, Input, Label, Table, Textarea } from "@/components/ui";
import { DialogImages } from "@/components/ui/dialog-images";
import { DialogIncluded } from "@/components/ui/dialog-included";
import { DialogNotIncluded } from "@/components/ui/dialog-not-included";
import { DialogPayments } from "@/components/ui/dialog-payments";
import { DialogProgram } from "@/components/ui/dialog-program";
import { ImageFile } from "@/components/ui/image-upload";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Item as SortableItem } from "@/components/ui/sortable-list";
import { createClient } from "@/utils/supabase/client";

function parseMaybeArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.startsWith("[")) {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return val ? [val] : [];
}

// Add helper to map between string[] and SortableItem[]
function programToSortableItems(program: string[]): SortableItem[] {
  return program.map((text, idx) => ({
    id: String(idx + 1),
    text,
    checked: false,
    description: "",
  }));
}
function sortableItemsToProgram(items: SortableItem[]): string[] {
  return items.map((item) => item.text);
}

// Interface for the form state, specifically for the trainers field
interface CampFormState {
  date_from?: string;
  date_to?: string;
  description?: string;
  id?: number;
  images?: (ImageFile | string)[];
  included?: string[];
  not_included?: string[];
  payments?: CampPayment[];
  place_id?: number | null;
  price?: number;
  program?: string[];
  title?: string;
  type?: string;
  camp_trainers?: any[];
}

// For new MultiSelect: id and label
type TrainerOption = { id: string; label: string };

export default function AdminCampsPanel() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CampFormState>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceType[]>([]);
  const [programItems, setProgramItems] = useState<SortableItem[]>([]);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [allTrainers, setAllTrainers] = useState<TrainerOption[]>([]);
  const supabase = createClient();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [bucketImages, setBucketImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [includedItems, setIncludedItems] = useState<SortableItem[]>([]);
  const [includedDialogOpen, setIncludedDialogOpen] = useState(false);
  const [payments, setPayments] = useState<CampPayment[]>([]);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);
  const [notIncludedItems, setNotIncludedItems] = useState<SortableItem[]>([]);
  const [notIncludedDialogOpen, setNotIncludedDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const campsData = await fetchCamps();
      setCamps(campsData);
      const { data: placesData } = await fetchPlaces();
      setPlaces(placesData || []);
      const { data: trainersData } = await fetchTrainers();
      setAllTrainers(
        trainersData?.map((trainer) => ({
          id: String(trainer.id),
          label: trainer.name,
        })) || []
      );
      setLoading(false);
    }
    loadData();
  }, []);

  // When editing, populate programItems from form.program
  useEffect(() => {
    if (form.program && Array.isArray(form.program)) {
      setProgramItems(programToSortableItems(form.program));
    } else {
      setProgramItems([]);
    }
  }, [form.program]);

  // When editing, populate includedItems from form.included
  useEffect(() => {
    if (form.included && Array.isArray(form.included)) {
      setIncludedItems(programToSortableItems(form.included));
    } else {
      setIncludedItems([]);
    }
  }, [form.included]);

  // When editing, populate payments from form.payments
  useEffect(() => {
    if (form.payments && Array.isArray(form.payments)) {
      setPayments(form.payments);
    } else {
      setPayments([]);
    }
  }, [form.payments]);

  // When editing, populate notIncludedItems from form.not_included
  useEffect(() => {
    if (form.not_included && Array.isArray(form.not_included)) {
      setNotIncludedItems(programToSortableItems(form.not_included));
    } else {
      setNotIncludedItems([]);
    }
  }, [form.not_included]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSelectChange(name: string, value: string | number) {
    setForm({ ...form, [name]: value });
  }

  function startEdit(row: any) {
    setEditingId(row.id ?? 0);
    // Map camp_trainers (array of {trainer: {id, name}}) to TrainerOption[] for UI
    const initialTrainers: TrainerOption[] = Array.isArray(row.camp_trainers)
      ? row.camp_trainers
          .map((ct: any) =>
            ct && ct.trainer && ct.trainer.id && ct.trainer.name
              ? { id: String(ct.trainer.id), label: ct.trainer.name }
              : null
          )
          .filter(Boolean)
      : [];
    setForm({
      ...row,
      images: parseMaybeArray(row.images),
      not_included: parseMaybeArray(row.not_included),
      program: parseMaybeArray(row.program),
      payments: parseMaybeArray(row.payments),
      camp_trainers: initialTrainers,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    // Reset form, ensuring trainers is an empty array of the expected type
    setForm({ camp_trainers: [] });
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this camp?")) return;
    const { error } = await deleteCamp(id);
    if (error) setError(error);
    else {
      setCamps(camps.filter((camp) => camp.id !== id));
    }
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.date_from || !form.date_to) {
      setError("Name, date_from, and date_to are required.");
      return;
    }
    setUploadingImages(true);
    let imageUrls: string[] = Array.isArray(form.images)
      ? form.images.filter((img) => typeof img === "string")
      : [];
    if (selectedImageFiles.length > 0) {
      try {
        for (const file of selectedImageFiles) {
          const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("camps")
            .upload(filePath, file, { upsert: false });
          if (uploadError) {
            setError("Image upload failed: " + uploadError.message);
            setUploadingImages(false);
            return;
          }
          const { data } = supabase.storage
            .from("camps")
            .getPublicUrl(filePath);
          imageUrls.push(data.publicUrl);
        }
      } catch (err: any) {
        setError("Image upload failed: " + (err?.message || err));
        setUploadingImages(false);
        return;
      }
    }
    setUploadingImages(false);
    const program = sortableItemsToProgram(programItems);
    const included = sortableItemsToProgram(includedItems);
    // Remove id and camp_trainers from the object before insert
    const { id, camp_trainers, ...rest } = {
      ...form,
      program,
      included,
      payments,
      images: imageUrls,
    };
    const submitForm = rest;

    let campId = editingId;
    let isNew = false;

    if (editingId) {
      // Update camp
      const { error } = await updateCamp(editingId, submitForm);
      if (error) {
        setError(error);
        setUploadingImages(false);
        return;
      }
    } else {
      // Insert new camp
      // Debug: log the payload before insert
      if (!editingId) {
        console.log("submitForm payload:", JSON.stringify(submitForm));
      }
      const { data, error } = await insertCamp(submitForm);
      if (error || !data) {
        setError(error || "Failed to create camp: no data returned");
        setUploadingImages(false);
        return;
      }
      campId = data.id;
      isNew = true;
    }
    // Update camp_trainers join table
    if (campId && Array.isArray(form.camp_trainers)) {
      await deleteCampTrainers(campId);
      if (form.camp_trainers.length > 0) {
        const trainersToInsert = form.camp_trainers.map((trainer: any) => ({
          camp_id: campId,
          trainer_id: parseInt(trainer.id, 10),
        }));
        await insertCampTrainers(trainersToInsert);
      }
    }
    setUploadingImages(false);
    cancelEdit();
    async function refreshCamps() {
      const campsData = await fetchCamps();
      setCamps(campsData);
    }
    refreshCamps();
  }

  // Fetch images from Supabase storage 'camps' bucket
  const fetchCampImages = useCallback(async () => {
    const { data, error } = await supabase.storage.from("camps").list();
    if (!error && data) {
      const urls = data
        .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(
          (file) =>
            supabase.storage.from("camps").getPublicUrl(file.name).data
              .publicUrl
        );
      setBucketImages(urls);
    }
  }, [supabase]);

  useEffect(() => {
    if (imageDialogOpen) fetchCampImages();
  }, [imageDialogOpen, fetchCampImages]);

  // Sync selectedImages with form.images
  useEffect(() => {
    if (Array.isArray(form.images)) {
      setSelectedImages(form.images.filter((img) => typeof img === "string"));
    } else {
      setSelectedImages([]);
    }
  }, [form.images]);

  const handlePaymentsChange = async (items: CampPayment[]) => {
    setPayments(items);
    setForm((f) => ({ ...f, payments: items }));
    if (editingId) {
      await updateCamp(editingId, { payments: items });
    }
  };

  const handleProgramChange = async (items: SortableItem[]) => {
    setProgramItems(items);
    const program = sortableItemsToProgram(items);
    setForm((f) => ({ ...f, program }));
    if (editingId) {
      await updateCamp(editingId, { program });
    }
  };

  const handleIncludedChange = async (items: SortableItem[]) => {
    setIncludedItems(items);
    const included = sortableItemsToProgram(items);
    setForm((f) => ({ ...f, included }));
    if (editingId) {
      await updateCamp(editingId, { included });
    }
  };

  const handleNotIncludedChange = async (items: SortableItem[]) => {
    setNotIncludedItems(items);
    const not_included = sortableItemsToProgram(items);
    setForm((f) => ({ ...f, not_included }));
    if (editingId) {
      await updateCamp(editingId, { not_included });
    }
  };

  // Table columns definition for shadcn Table
  const columns = [
    { key: "id", header: "Id" },
    { key: "title", header: "Nazwa" },
    { key: "date_from", header: "Data od" },
    { key: "date_to", header: "Data do" },
    {
      key: "description",
      header: "Opis",
      render: (row: Camp) => (
        <span className="line-clamp-2">{row.description}</span>
      ),
    },
    {
      key: "place_id",
      header: "Lokalizacja",
      render: (row: Camp) => {
        const place = places.find((p) => p.id === row.place_id);
        return place ? place.name : "";
      },
    },
    { key: "price", header: "Cena" },
    {
      key: "actions",
      header: "Akcje",
      render: (row: Camp) => (
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => startEdit(row)}
          >
            Edytuj
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.id ?? 0)}
          >
            Usuń
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
        Zarządzaj obozami
      </h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"
      >
        <div className="gap-4 flex flex-col">
          <div>
            <Label htmlFor="title" className="text-gray-500">
              Nazwa <span className="text-red-500">*</span>
            </Label>
            <Input
              name="title"
              value={form.title || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-gray-500">
              Typ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.type || ""}
              onValueChange={(v) => handleSelectChange("type", v)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz typ obozu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="polkolonie">Półkolonie</SelectItem>
                <SelectItem value="letnie">Obóz letni</SelectItem>
                <SelectItem value="zimowe">Obóz zimowy</SelectItem>
                <SelectItem value="nocowanka">Nocowanka</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="date_from" className="text-gray-500">
                Data od <span className="text-red-500">*</span>
              </Label>
              <Input
                name="date_from"
                type="date"
                value={form.date_from || ""}
                onChange={handleChange}
                required
                className="date-icon-visible"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="date_to" className="text-gray-500">
                Data do <span className="text-red-500">*</span>
              </Label>
              <Input
                name="date_to"
                type="date"
                value={form.date_to || ""}
                onChange={handleChange}
                required
                className="date-icon-visible"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="price" className="text-gray-500">
              Cena (zł)
            </Label>
            <Input
              name="price"
              value={form.price || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="place_id" className="text-gray-500">
              Lokalizacja
            </Label>
            <Select
              value={form.place_id ? String(form.place_id) : ""}
              onValueChange={(v) => handleSelectChange("place_id", Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz lokalizację" />
              </SelectTrigger>
              <SelectContent>
                {places.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-500">
              Opis
            </Label>
            <Textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label
              htmlFor="included"
              className="text-gray-500 flex items-center gap-1"
            >
              Oferta zawiera
            </Label>
            <div className="flex gap-2 mb-2 items-center">
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="m-2 bg-gray-600"
                  onClick={() => setIncludedDialogOpen(true)}
                  disabled={!editingId}
                >
                  Edytuj zawartość oferty
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="m-2"
                  onClick={() => setIncludedDialogOpen(true)}
                  disabled={!!editingId}
                >
                  Dodaj zawartość oferty
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-gray-400 border border-gray-300 px-2 py-1"
                onClick={() =>
                  handleIncludedChange([
                    { id: "1", text: "Brak", checked: false, description: "" },
                  ])
                }
              >
                Brak
              </Button>
            </div>
            <DialogIncluded
              open={includedDialogOpen}
              onOpenChange={setIncludedDialogOpen}
              items={includedItems}
              onChange={handleIncludedChange}
              disabled={editingId ? false : false}
            />
            {/* Read-only list of included below the button */}
            <ul className="mt-2 list-disc list-inside text-sm">
              {(form.included || []).map((inc, idx) => (
                <li key={idx}>{inc}</li>
              ))}
            </ul>
          </div>
          <div>
            <Label htmlFor="images" className="flex mb-2 text-md text-gray-500">
              Zdjęcia
            </Label>
            <Button
              type="button"
              variant="secondary"
              className="m-2"
              onClick={() => setImageDialogOpen(true)}
              disabled={uploadingImages}
            >
              Wybierz zdjęcia
            </Button>
            <DialogImages
              open={imageDialogOpen}
              onOpenChange={setImageDialogOpen}
              selectedImages={selectedImages}
              onChange={(imgs) => {
                setSelectedImages(imgs);
                setForm((f) => ({ ...f, images: imgs }));
              }}
              disabled={uploadingImages}
            />
            {/* Show previews of selected images below the button */}
            {selectedImages.length > 0 && (
              <>
                <div className="mt-2 text-sm">Wybrane zdjęcia:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedImages.map((url) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt="Wybrane zdjęcie"
                        className="w-16 h-16 object-cover rounded border cursor-zoom-in"
                        onClick={() => setEnlargedImage(url)}
                      />
                      <button
                        type="button"
                        title="Usuń z wybranych"
                        onClick={() => {
                          setSelectedImages((imgs) =>
                            imgs.filter((img) => img !== url)
                          );
                          setForm((f) => ({
                            ...f,
                            images: (f.images || []).filter(
                              (img) => img !== url
                            ),
                          }));
                        }}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity border border-red-200 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Enlarged image modal */}
                {enlargedImage && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative">
                      <img
                        src={enlargedImage}
                        alt="Enlarged"
                        className="max-w-[90vw] max-h-[80vh] rounded shadow-lg border-2 border-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white/80 rounded-full p-2 text-gray-800 hover:bg-white"
                        onClick={() => setEnlargedImage(null)}
                        aria-label="Zamknij powiększenie"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    {/* Click outside to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setEnlargedImage(null)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="gap-4 flex flex-col">
          <div>
            <Label
              htmlFor="not_included"
              className="text-gray-500 flex items-center gap-1"
            >
              Nie zawiera
            </Label>
            <div className="flex gap-2 mb-2 items-center">
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="m-2 bg-gray-600"
                  onClick={() => setNotIncludedDialogOpen(true)}
                  disabled={!editingId}
                >
                  Edytuj pozycje nie zawiera
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="m-2"
                  onClick={() => setNotIncludedDialogOpen(true)}
                  disabled={!!editingId}
                >
                  Dodaj pozycje nie zawiera
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-gray-400 border border-gray-300 px-2 py-1"
                onClick={() =>
                  handleNotIncludedChange([
                    { id: "1", text: "Brak", checked: false, description: "" },
                  ])
                }
              >
                Brak
              </Button>
            </div>
            <DialogNotIncluded
              open={notIncludedDialogOpen}
              onOpenChange={setNotIncludedDialogOpen}
              items={notIncludedItems}
              onChange={handleNotIncludedChange}
              disabled={false}
            />
            {/* Read-only list of not_included below the button */}
            <ul className="mt-2 list-disc list-inside text-sm">
              {(form.not_included || []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <Label htmlFor="trainers" className="text-gray-500">
              Trenerzy
            </Label>
            <MultiSelect
              options={allTrainers.map((t) => ({
                label: t.label,
                value: t.id,
              }))}
              defaultValue={
                Array.isArray(form.camp_trainers)
                  ? form.camp_trainers.map((t: any) => String(t.id))
                  : []
              }
              onValueChange={(selectedIds) => {
                const selectedTrainers = allTrainers.filter((t) =>
                  selectedIds.includes(t.id)
                );
                setForm({
                  ...form,
                  camp_trainers: selectedTrainers,
                });
              }}
              placeholder="Wybierz trenerów..."
            />
          </div>
          <div>
            <Label
              htmlFor="payments"
              className="text-gray-500 flex items-center gap-1"
            >
              Płatności
            </Label>
            <div className="flex gap-2 mb-2 items-center">
              <Button
                type="button"
                variant={editingId ? "outline" : "secondary"}
                className={editingId ? "m-2 bg-gray-600" : "m-2"}
                onClick={() => setPaymentsDialogOpen(true)}
                disabled={uploadingImages}
              >
                {editingId ? "Edytuj płatności" : "Dodaj płatności"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-gray-400 border border-gray-300 px-2 py-1"
                onClick={() =>
                  handlePaymentsChange([{ installment: 1, amount: 0, due: "" }])
                }
              >
                Brak
              </Button>
            </div>
            <DialogPayments
              open={paymentsDialogOpen}
              onOpenChange={setPaymentsDialogOpen}
              items={payments.map((p, idx) => ({ ...p, id: String(idx) }))}
              onChange={(items) =>
                handlePaymentsChange(items.map(({ id, ...rest }) => rest))
              }
              disabled={uploadingImages}
            />
            {/* Read-only list of payments below the button */}
            <ul className="mt-2 list-disc list-inside text-sm">
              {(form.payments || []).map((payment, idx) => (
                <li key={idx}>
                  <b>
                    {payment.installment}. {payment.amount} zł
                  </b>{" "}
                  - {payment.due}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Label
              htmlFor="program"
              className="text-gray-500 flex items-center gap-1"
            >
              Program
            </Label>
            <div className="flex gap-2 mb-2 items-center">
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="m-2 bg-gray-600"
                  onClick={() => setProgramDialogOpen(true)}
                  disabled={!editingId}
                >
                  Edytuj program
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="m-2"
                  onClick={() => setProgramDialogOpen(true)}
                  disabled={!!editingId}
                >
                  Dodaj program
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-gray-400 border border-gray-300 px-2 py-1"
                onClick={() =>
                  handleProgramChange([
                    { id: "1", text: "Brak", checked: false, description: "" },
                  ])
                }
              >
                Brak
              </Button>
            </div>
            <DialogProgram
              open={programDialogOpen}
              onOpenChange={setProgramDialogOpen}
              items={programItems}
              onChange={handleProgramChange}
              disabled={editingId ? false : false}
            />
            {/* Read-only list of program below the button */}
            <ul className="mt-2 list-disc list-inside text-sm">
              {(form.program || []).map((prog, idx) => (
                <li key={idx}>{prog}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
          <Button
            type="submit"
            variant="default"
            disabled={uploadingImages}
            className="w-full sm:w-auto bg-risu-300 hover:bg-risu-600"
          >
            {editingId ? "Zapisz zmiany" : "Dodaj obóz"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
              disabled={uploadingImages}
              className="w-full sm:w-auto"
            >
              Anuluj
            </Button>
          )}
          {!editingId && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setForm({ camp_trainers: [] });
                setProgramItems([]);
                setIncludedItems([]);
                setNotIncludedItems([]);
                setPayments([]);
                setSelectedImages([]);
                setSelectedImageFiles([]);
              }}
              disabled={uploadingImages}
              className="w-full sm:w-auto"
            >
              Wyczyść formularz
            </Button>
          )}
        </div>
      </form>
      <div className="-mx-2 sm:mx-0">
        <Table
          columns={columns}
          data={camps}
          loading={loading}
          emptyText="Brak obozów."
        />
      </div>
    </div>
  );
}
