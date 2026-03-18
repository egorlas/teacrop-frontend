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
      <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed text-muted-foreground">
        {/* description đã là HTML (từ Lexical), render trực tiếp */}
        <div
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </section>
  );
}

