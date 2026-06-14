package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AlunoRepository extends JpaRepository<Aluno, String> {

    Optional<Aluno> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}
