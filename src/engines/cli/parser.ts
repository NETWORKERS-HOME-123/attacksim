import { CLICommand, CLIMode, DefenseActionType } from '@/types';

// ============================================
// CLI Parser
// ============================================

export interface ParsedCommand extends CLICommand {
  action?: DefenseActionType;
  targetDevice?: string;
  parameters?: Record<string, unknown>;
}

export class CLIParser {
  private mode: CLIMode = 'admin';

  setMode(mode: CLIMode): void {
    this.mode = mode;
  }

  getMode(): CLIMode {
    return this.mode;
  }

  parse(input: string): ParsedCommand {
    const trimmed = input.trim();
    
    if (trimmed === '') {
      return {
        raw: input,
        command: '',
        args: [],
        mode: this.mode,
        isValid: false,
        error: 'Empty command',
      };
    }

    const tokens = this.tokenize(trimmed);
    const command = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    // Command routing
    switch (command) {
      case 'help':
      case '?':
        return this.parseHelp(args);
      case 'show':
        return this.parseShow(args);
      case 'isolate':
        return this.parseIsolate(args);
      case 'block':
        return this.parseBlock(args);
      case 'scan':
        return this.parseScan(args);
      case 'patch':
        return this.parsePatch(args);
      case 'reset':
        return this.parseReset(args);
      case 'enable':
        return this.parseEnable(args);
      case 'disable':
        return this.parseDisable(args);
      case 'mode':
        return this.parseMode(args);
      case 'clear':
        return this.parseClear();
      default:
        return {
          raw: input,
          command,
          args,
          mode: this.mode,
          isValid: false,
          error: `Unknown command: ${command}. Type 'help' for available commands.`,
        };
    }
  }

  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of input) {
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }

  private parseHelp(args: string[]): ParsedCommand {
    return {
      raw: `help ${args.join(' ')}`,
      command: 'help',
      args,
      mode: this.mode,
      isValid: true,
    };
  }

  private parseShow(args: string[]): ParsedCommand {
    if (args.length === 0) {
      return {
        raw: 'show',
        command: 'show',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: show <logs|alerts|devices|topology|status>',
      };
    }

    const subcommand = args[0].toLowerCase();
    const validSubcommands = ['logs', 'alerts', 'devices', 'topology', 'status', 'stats'];

    if (!validSubcommands.includes(subcommand)) {
      return {
        raw: `show ${args.join(' ')}`,
        command: 'show',
        args,
        mode: this.mode,
        isValid: false,
        error: `Unknown show subcommand: ${subcommand}. Valid: ${validSubcommands.join(', ')}`,
      };
    }

    return {
      raw: `show ${args.join(' ')}`,
      command: 'show',
      args,
      mode: this.mode,
      isValid: true,
    };
  }

  private parseIsolate(args: string[]): ParsedCommand {
    if (args.length === 0) {
      return {
        raw: 'isolate',
        command: 'isolate',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: isolate <device_id|device_name>',
      };
    }

    const target = args[0];

    return {
      raw: `isolate ${args.join(' ')}`,
      command: 'isolate',
      args,
      mode: this.mode,
      isValid: true,
      action: 'isolate_device',
      targetDevice: target,
    };
  }

  private parseBlock(args: string[]): ParsedCommand {
    // block ip <ip> [on <device>]
    if (args.length < 2 || args[0].toLowerCase() !== 'ip') {
      return {
        raw: `block ${args.join(' ')}`,
        command: 'block',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: block ip <ip_address> [on <device_id>]',
      };
    }

    const ip = args[1];
    let targetDevice = 'firewall-1'; // Default to firewall

    if (args.length >= 4 && args[2].toLowerCase() === 'on') {
      targetDevice = args[3];
    }

    return {
      raw: `block ${args.join(' ')}`,
      command: 'block',
      args,
      mode: this.mode,
      isValid: true,
      action: 'block_ip',
      targetDevice,
      parameters: { ip },
    };
  }

  private parseScan(args: string[]): ParsedCommand {
    // scan network [device_id]
    if (args.length === 0 || args[0].toLowerCase() !== 'network') {
      return {
        raw: `scan ${args.join(' ')}`,
        command: 'scan',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: scan network [device_id]',
      };
    }

    const targetDevice = args[1] || 'all';

    return {
      raw: `scan ${args.join(' ')}`,
      command: 'scan',
      args,
      mode: this.mode,
      isValid: true,
      action: 'scan_network',
      targetDevice,
    };
  }

  private parsePatch(args: string[]): ParsedCommand {
    // apply patch <device>
    if (args.length === 0) {
      return {
        raw: 'patch',
        command: 'patch',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: patch <device_id|device_name>',
      };
    }

    const target = args[0];

    return {
      raw: `patch ${args.join(' ')}`,
      command: 'patch',
      args,
      mode: this.mode,
      isValid: true,
      action: 'patch_system',
      targetDevice: target,
    };
  }

  private parseReset(args: string[]): ParsedCommand {
    // reset credentials <device>
    if (args.length < 2 || args[0].toLowerCase() !== 'credentials') {
      return {
        raw: `reset ${args.join(' ')}`,
        command: 'reset',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: reset credentials <device_id|device_name>',
      };
    }

    const target = args[1];

    return {
      raw: `reset ${args.join(' ')}`,
      command: 'reset',
      args,
      mode: this.mode,
      isValid: true,
      action: 'reset_credentials',
      targetDevice: target,
    };
  }

  private parseEnable(args: string[]): ParsedCommand {
    if (args.length === 0) {
      return {
        raw: 'enable',
        command: 'enable',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: enable <firewall> [on <device>]',
      };
    }

    const feature = args[0].toLowerCase();
    let targetDevice = args.length >= 3 && args[1].toLowerCase() === 'on' 
      ? args[2] 
      : 'firewall-1';

    if (feature === 'firewall') {
      return {
        raw: `enable ${args.join(' ')}`,
        command: 'enable',
        args,
        mode: this.mode,
        isValid: true,
        action: 'enable_firewall',
        targetDevice,
      };
    }

    return {
      raw: `enable ${args.join(' ')}`,
      command: 'enable',
      args,
      mode: this.mode,
      isValid: false,
      error: `Unknown feature: ${feature}. Available: firewall`,
    };
  }

  private parseDisable(args: string[]): ParsedCommand {
    if (args.length === 0) {
      return {
        raw: 'disable',
        command: 'disable',
        args,
        mode: this.mode,
        isValid: false,
        error: 'Usage: disable <smb> [on <device>]',
      };
    }

    const feature = args[0].toLowerCase();
    let targetDevice = args.length >= 3 && args[1].toLowerCase() === 'on' 
      ? args[2] 
      : 'all';

    if (feature === 'smb') {
      return {
        raw: `disable ${args.join(' ')}`,
        command: 'disable',
        args,
        mode: this.mode,
        isValid: true,
        action: 'disable_smb',
        targetDevice,
      };
    }

    return {
      raw: `disable ${args.join(' ')}`,
      command: 'disable',
      args,
      mode: this.mode,
      isValid: false,
      error: `Unknown feature: ${feature}. Available: smb`,
    };
  }

  private parseMode(args: string[]): ParsedCommand {
    if (args.length === 0) {
      return {
        raw: 'mode',
        command: 'mode',
        args,
        mode: this.mode,
        isValid: true,
        message: `Current mode: ${this.mode}`,
      };
    }

    const newMode = args[0].toLowerCase() as CLIMode;
    const validModes: CLIMode[] = ['user', 'admin', 'config'];

    if (!validModes.includes(newMode)) {
      return {
        raw: `mode ${args.join(' ')}`,
        command: 'mode',
        args,
        mode: this.mode,
        isValid: false,
        error: `Invalid mode: ${newMode}. Valid modes: ${validModes.join(', ')}`,
      };
    }

    this.mode = newMode;

    return {
      raw: `mode ${args.join(' ')}`,
      command: 'mode',
      args,
      mode: this.mode,
      isValid: true,
      message: `Switched to ${newMode} mode`,
    };
  }

  private parseClear(): ParsedCommand {
    return {
      raw: 'clear',
      command: 'clear',
      args: [],
      mode: this.mode,
      isValid: true,
    };
  }

  // Generate help text
  getHelpText(): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                 CYBER DEFENSE SIMULATOR - CLI                 ║
╠══════════════════════════════════════════════════════════════╣
  COMMANDS:
  ─────────
  help                              Show this help message
  show logs                         Display security logs
  show alerts                       Display active alerts
  show devices                      List all network devices
  show topology                     Display network topology
  show status                       Show simulation status
  
  isolate <device>                  Disconnect device from network
  block ip <ip> [on <device>]       Block traffic from IP address
  scan network [device]             Scan for compromised nodes
  patch <device>                    Apply security patch
  reset credentials <device>        Reset user credentials
  enable firewall [on <device>]     Enable firewall protection
  disable smb [on <device>]         Disable SMB/file sharing
  
  mode <user|admin|config>          Switch CLI mode
  clear                             Clear terminal screen
  
  EXAMPLES:
  ─────────
  isolate host-1
  block ip 192.168.1.100 on firewall-1
  scan network
  patch host-2
  enable firewall

╚══════════════════════════════════════════════════════════════╝
`;
  }
}
