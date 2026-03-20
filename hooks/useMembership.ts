import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isUserMember } from '../lib/access';

export interface MembershipStatus {
  isMember: boolean;
  loading: boolean;
  userId: string | null;
  userProfile: {
    membership_expires_at?: string | null;
    is_member?: boolean | null;
  } | null;
}

/**
 * 获取用户会员状态
 * 以 membership_expires_at 为准判断是否为有效会员
 */
export function useMembership(): MembershipStatus {
  const [state, setState] = useState<MembershipStatus>({
    isMember: false,
    loading: true,
    userId: null,
    userProfile: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchMembershipStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setState({ isMember: false, loading: false, userId: null, userProfile: null });
          }
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('membership_expires_at, is_member')
          .eq('id', user.id)
          .single();

        if (!cancelled) {
          const isMember = isUserMember(profile);
          setState({
            isMember,
            loading: false,
            userId: user.id,
            userProfile: profile,
          });
        }
      } catch (error) {
        console.error('[useMembership] 获取会员状态失败:', error);
        if (!cancelled) {
          setState({ isMember: false, loading: false, userId: null, userProfile: null });
        }
      }
    }

    fetchMembershipStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

