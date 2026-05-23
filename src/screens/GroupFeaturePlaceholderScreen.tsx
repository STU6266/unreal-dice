import { Link, useNavigate, useParams } from 'react-router-dom'
import { copy } from '../content/en'
import { QUICK_START_TEMPLATES } from '../domain/data/quickStartTemplates'
import { loadUserGroups } from '../services/storageService'

interface GroupFeaturePlaceholderScreenProps {
  mode: 'play-quick-start' | 'play-group' | 'edit-group'
}

export function GroupFeaturePlaceholderScreen({
  mode,
}: GroupFeaturePlaceholderScreenProps) {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const placeholder = getPlaceholderContent(mode, groupId)

  return (
    <section className="placeholder-screen" aria-labelledby="placeholder-title">
      <div className="placeholder-panel">
        <p className="eyebrow">{placeholder.eyebrow}</p>
        <h1 id="placeholder-title">{placeholder.title}</h1>
        <p>{placeholder.message}</p>
        <button className="text-link" type="button" onClick={() => navigate(-1)}>
          {copy.groupFeaturePlaceholder.back}
        </button>
        {placeholder.isMissing ? (
          <Link className="text-link" to="/groups">
            {copy.myGroups.title}
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function getPlaceholderContent(
  mode: GroupFeaturePlaceholderScreenProps['mode'],
  groupId: string | undefined,
) {
  if (mode === 'play-quick-start') {
    const template = QUICK_START_TEMPLATES.find((item) => item.id === groupId)

    return {
      eyebrow: copy.groupFeaturePlaceholder.playEyebrow,
      title: template?.name ?? copy.groupFeaturePlaceholder.missingGroupTitle,
      message: template
        ? copy.groupFeaturePlaceholder.playQuickStartMessage
        : copy.groupFeaturePlaceholder.missingGroupMessage,
      isMissing: template === undefined,
    }
  }

  const group = loadUserGroups().find((item) => item.id === groupId)
  const isEdit = mode === 'edit-group'

  return {
    eyebrow: isEdit
      ? copy.groupFeaturePlaceholder.editEyebrow
      : copy.groupFeaturePlaceholder.playEyebrow,
    title: group?.name ?? copy.groupFeaturePlaceholder.missingGroupTitle,
    message:
      group === undefined
        ? copy.groupFeaturePlaceholder.missingGroupMessage
        : isEdit
          ? copy.groupFeaturePlaceholder.editGroupMessage
          : copy.groupFeaturePlaceholder.playGroupMessage,
    isMissing: group === undefined,
  }
}
