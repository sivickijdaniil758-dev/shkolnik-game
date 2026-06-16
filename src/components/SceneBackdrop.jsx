import ClassroomBackground from './ClassroomBackground'

function SceneBackdrop({ children, variant = 'default', className = '' }) {
  return (
    <div className={`scene-screen scene-${variant} ${className}`.trim()}>
      <ClassroomBackground blurred />
      <div className="scene-light-rays" aria-hidden="true" />
      <div className="scene-vignette" aria-hidden="true" />
      <div className="scene-content">{children}</div>
    </div>
  )
}

export default SceneBackdrop
