package com.fsd.taskmanagement.app.service;

import com.fsd.taskmanagement.app.model.Task;
import com.fsd.taskmanagement.app.model.User;
import com.fsd.taskmanagement.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("userService")
public class UserService {

    @Autowired
    UserRepository userRepository;

    public List<User> findAllUser()
    {
        List<User> userList = new ArrayList();
        Iterable<User> allList = userRepository.findAll();
        if(null != allList)
        {
            userList = (List<User>) allList;
        }
        return userList;
    }

    public User findUser(Long userId)
    {
        return userRepository.findById(userId).get();
    }

    public User addUser(User user)
    {
        if(user != null) {
            return userRepository.save(user);
        }else
        {
            return null;
        }
    }

    public void deleteUser(long userId) {
        userRepository.deleteUser(userId);
    }
}
