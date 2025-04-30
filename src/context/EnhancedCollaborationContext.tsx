import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as Y from 'yjs';
import EnhancedWebSocketService, { ConnectionStatus