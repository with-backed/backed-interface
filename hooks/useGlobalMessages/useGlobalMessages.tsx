import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react';

export type MessageKind = 'error' | 'info' | 'success';

type Message = {
  kind: MessageKind;
  message: React.ReactNode | string;
};

type ReducerState = {
  messages: Message[];
};

type ReducerAction = {
  type: 'add' | 'delete';
  message: Message;
};

function messageReducer(
  state: ReducerState,
  action: ReducerAction,
): ReducerState {
  switch (action.type) {
    case 'add': {
      return { messages: [...state.messages, action.message] };
    }
    case 'delete': {
      return {
        messages: state.messages.filter((m) => m.message !== action.message),
      };
    }
  }
}

const GlobalMessageContext = createContext<{
  state: ReducerState;
  dispatch: React.Dispatch<ReducerAction>;
}>({ state: { messages: [] }, dispatch: () => {} });

export const GlobalMessagingProvider: React.FunctionComponent = ({
  children,
}) => {
  const [state, dispatch] = useReducer(messageReducer, { messages: [] });
  const value = { state, dispatch };
  return (
    <GlobalMessageContext.Provider value={value}>
      {children}
    </GlobalMessageContext.Provider>
  );
};

export function useGlobalMessages() {
  const { state, dispatch } = useContext(GlobalMessageContext);

  const addMessage = useCallback(
    (message: Message) => {
      dispatch({ type: 'add', message });
    },
    [dispatch],
  );

  const removeMessage = useCallback(
    (message: Message) => {
      dispatch({ type: 'delete', message });
    },
    [dispatch],
  );

  return {
    addMessage,
    messages: state,
    removeMessage,
  };
}
