type StarsProps = {
  rating: number;
};

export function Stars({ rating }: StarsProps) {
  const normalized = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="stars" aria-label={`${normalized} 星`} title={`${normalized} 星`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < normalized ? "star-filled" : "star-empty"} aria-hidden="true">
          {index < normalized ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
