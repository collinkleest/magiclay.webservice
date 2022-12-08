import { Exception } from './Exception';

export const UserExistsException: Exception = {
  statusCode: 400,
  message: ['user is already created'],
  error: 'Bad Request',
};

export const NoUserException: Exception = {
  statusCode: 400,
  message: ['no user exists'],
  error: 'Bad Request',
};
