type ProductDescriptionProps = {
  description?: string;
};

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Mô tả sản phẩm</h2>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  );
}

