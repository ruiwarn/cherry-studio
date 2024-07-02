import { FC, useRef } from 'react'
import styled from 'styled-components'
import useAgents from '@renderer/hooks/useAgents'
import { Agent } from '@renderer/types'
import { Dropdown, MenuProps } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { last } from 'lodash'
import AgentSettingPopup from '@renderer/components/Popups/AgentSettingPopup'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

interface Props {
  activeAgent: Agent
  onActive: (agent: Agent) => void
}

const Agents: FC<Props> = ({ activeAgent, onActive }) => {
  const { agents, removeAgent, updateAgent } = useAgents()
  const targetAgent = useRef<Agent | null>(null)

  const onDelete = (agent: Agent) => {
    removeAgent(agent.id)
    setTimeout(() => {
      const _agent = last(agents.filter((a) => a.id !== agent.id))
      _agent && onActive(_agent)
    }, 0)
  }

  const items: MenuProps['items'] = [
    {
      label: 'Edit',
      key: 'edit',
      icon: <EditOutlined />,
      async onClick() {
        if (targetAgent.current) {
          const _agent = await AgentSettingPopup.show({ agent: targetAgent.current })
          updateAgent(_agent)
        }
      }
    },
    { type: 'divider' },
    {
      label: 'Delete',
      key: 'delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => targetAgent.current && onDelete(targetAgent.current)
    }
  ]

  return (
    <Container>
      {agents.map((agent) => (
        <AgentItem
          data-id={agent.id}
          key={agent.id}
          onClick={() => onActive(agent)}
          className={agent.id === activeAgent?.id ? 'active' : ''}>
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottom"
            arrow
            onOpenChange={() => (targetAgent.current = agent)}>
            <MenuButton className="menu-button" onClick={(e) => e.stopPropagation()}>
              <MoreOutlined />
            </MenuButton>
          </Dropdown>
          <AgentName>{agent.name}</AgentName>
          <AgentLastMessage>{agent.description}</AgentLastMessage>
        </AgentItem>
      ))}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: var(--agents-width);
  max-width: var(--agents-width);
  border-right: 0.5px solid var(--color-border);
  height: calc(100vh - var(--navbar-height));
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`

const AgentItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  position: relative;
  cursor: pointer;
  .anticon {
    display: none;
  }
  &:hover {
    background-color: var(--color-background-soft);
    .anticon {
      display: block;
      color: var(--color-text-1);
    }
  }
  &.active {
    background-color: var(--color-background-mute);
    cursor: pointer;
  }
`

const AgentName = styled.div`
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: bold;
`

const AgentLastMessage = styled.div`
  font-size: 12px;
  line-height: 20px;
  color: var(--color-text-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  height: 20px;
`

const MenuButton = styled.div`
  padding: 5px;
  position: absolute;
  width: 30px;
  height: 30px;
  right: 10px;
  top: 10px;
  font-size: 18px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #ffffff30;
    .anticon {
      color: white;
    }
  }
`

export default Agents
