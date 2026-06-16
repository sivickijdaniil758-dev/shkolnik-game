import classroomBg from '../assets/classroom-bg.png'

/** Фото класса + лёгкие атмосферные слои поверх (без CSS-«рисованного» класса) */
function ClassroomPhotoBackground() {
  return (
    <div className="classroom-photo-bg" aria-hidden="true">
      <img src={classroomBg} alt="" className="classroom-photo-img" decoding="async" />
      <div className="photo-fx photo-sunbeams" />
      <div className="photo-fx photo-gleam" />
      <div className="photo-fx photo-dust" />
      <div className="photo-fx photo-fly" />
      <div className="photo-clock-overlay">
        <div className="photo-clock-face">
          <div className="photo-clock-hand photo-clock-hour" />
          <div className="photo-clock-hand photo-clock-minute" />
        </div>
      </div>
    </div>
  )
}

export default ClassroomPhotoBackground
