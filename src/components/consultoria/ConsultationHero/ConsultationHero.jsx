import "./ConsultationHero.css";

function ConsultationHero() {
  return (
    <section className="consultoria-hero">
      <div className="consultoria-hero__content">
        <span className="consultoria-hero__eyebrow">CircusCoach</span>

        <h1>Consultoría personal</h1>

        <p className="consultoria-hero__lead">
          Si tu entrenamiento ya no te alcanza, no es porque te falte disciplina.
        </p>

        <p className="consultoria-hero__lead">
          Es porque algo más profundo está pidiendo cambiar.
        </p>

        <p className="consultoria-hero__text">
          Trabajo con artistas que están cansados de exigirse sin sentido, de
          entrenar en automático y de sentirse cada vez más lejos de lo que aman.
        </p>
      </div>
    </section>
  );
}

export default ConsultationHero;