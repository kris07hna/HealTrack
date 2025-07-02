import { healthGoalsHelpers } from '../lib/supabase-helpers';
import { supabase } from '../lib/database';

jest.mock('../lib/database', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: '123', current_value: 6, achieved: false }, error: null }),
  },
}));

describe('healthGoalsHelpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update goal progress correctly', async () => {
    const goalId = 'test-goal-id';
    const newValue = 10;
    const isAchieved = true;

    const result = await healthGoalsHelpers.updateGoalProgress(goalId, newValue, isAchieved);

    expect(supabase.from).toHaveBeenCalledWith('health_goals');
    expect(supabase.update).toHaveBeenCalledWith({ current_value: newValue, achieved: isAchieved });
    expect(supabase.eq).toHaveBeenCalledWith('id', goalId);
    expect(result).toEqual({ id: '123', current_value: 6, achieved: false });
  });
});
